import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/db';
import { aiRouter } from '@/app/lib/ai/router';
import { checkUsageLimit } from '@/app/lib/usage';
import { canUseModel } from '@/app/lib/stripe';
import { z } from 'zod';

const chatRequestSchema = z.object({
  modelId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  conversationId: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = chatRequestSchema.parse(body);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check usage limits
    const canSendMessage = await checkUsageLimit(user.id);
    if (!canSendMessage) {
      return NextResponse.json(
        { error: 'Monthly message limit reached. Please upgrade your plan.' },
        { status: 429 }
      );
    }

    // Check model access permissions
    const userPlan = (user.subscription?.plan as any) || 'FREE';
    if (!canUseModel(userPlan, validatedData.modelId)) {
      return NextResponse.json(
        { error: `Model ${validatedData.modelId} requires a higher subscription tier` },
        { status: 403 }
      );
    }

    // Create or get conversation
    let conversation;
    if (validatedData.conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: validatedData.conversationId,
          userId: user.id,
        },
      });
    }

    if (!conversation) {
      const title = validatedData.messages[0]?.content.slice(0, 100) || 'New Conversation';
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title,
          model: validatedData.modelId as any,
        },
      });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: user.id,
        role: 'USER',
        content: validatedData.messages[validatedData.messages.length - 1].content,
      },
    });

    // Get AI response via router (includes fallback logic)
    const response = await aiRouter.chat({
      modelId: validatedData.modelId,
      messages: validatedData.messages,
      temperature: validatedData.temperature,
      maxTokens: validatedData.maxTokens,
      userId: user.id,
      conversationId: conversation.id,
    });

    // Log if fallback was used
    if (response.fallback) {
      console.info(
        `[Chat] Fallback used for user ${user.id}: ${validatedData.modelId} -> ${response.model}`
      );
    }

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: user.id,
        role: 'ASSISTANT',
        content: response.content,
        model: response.model as any, // Use actual model that responded
        tokenCount: response.usage?.totalTokens,
      },
    });

    return NextResponse.json(
      {
        conversationId: conversation.id,
        message: {
          id: assistantMessage.id,
          content: response.content,
          role: 'assistant',
          model: response.model,
          usage: response.usage,
          fallback: response.fallback, // Include fallback flag for client
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Surface detailed error info
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred in chat handler';

    // Check if error is due to no available providers
    if (
      message.includes('No healthy fallback') ||
      message.includes('Provider') ||
      message.includes('not initialized')
    ) {
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          details: message,
          retryable: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: message,
      },
      { status: 500 }
    );
  }
}
