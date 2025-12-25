import { NextRequest } from 'next/server';
import { getUserId } from '@/app/lib/auth';
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
    // Try Clerk auth + fallback
    // Use getUserId which supports the dev header `x-dev-clerk-id` in non-production
    const userId = await getUserId(req);
    if (!userId) {
      console.error('Auth failed in chat/stream - no userId');
      return new Response(JSON.stringify({ error: 'Unauthorized - please sign in' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const validatedData = chatRequestSchema.parse(body);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Check usage limits
    const canSendMessage = await checkUsageLimit(user.id);
    if (!canSendMessage) {
      return new Response('Monthly message limit reached. Please upgrade your plan.', { status: 429 });
    }

    // Check model access permissions
    const userPlan = (user.subscription?.plan as any) || 'FREE';
    if (!canUseModel(userPlan, validatedData.modelId)) {
      return new Response(`Model ${validatedData.modelId} requires a higher subscription tier`, { status: 403 });
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
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: user.id,
        role: 'USER',
        content: validatedData.messages[validatedData.messages.length - 1].content,
      },
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = '';

        try {
          // Send conversation ID first
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'conversation', id: conversation.id })}\n\n`)
          );

          // Stream the AI response with fallback
          try {
            for await (const chunk of aiRouter.chatStream({
              modelId: validatedData.modelId,
              messages: validatedData.messages,
              temperature: validatedData.temperature,
              maxTokens: validatedData.maxTokens,
              userId: user.id,
              conversationId: conversation.id,
            })) {
              fullContent += chunk;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'content', content: chunk })}\n\n`)
              );
            }
          } catch (streamError) {
            console.error('Stream error, using fallback:', streamError);
            const mockResponse = `Demo response. Configure AI provider keys in .env.local to enable real responses.`;
            fullContent = mockResponse;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'content', content: mockResponse })}\n\n`)
            );
          }

          // Save assistant message after streaming completes
          const assistantMessage = await prisma.message.create({
            data: {
              conversationId: conversation.id,
              userId: user.id,
              role: 'ASSISTANT',
              content: fullContent,
              model: validatedData.modelId as any,
            },
          });

          // Send completion event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done', messageId: assistantMessage.id })}\n\n`)
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Stream error' })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat stream error:', error);

    if (error instanceof z.ZodError) {
      return new Response('Invalid request data', { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred in chat stream handler';

    // Return a plain text error so the client can at least see *why* it failed
    return new Response(`Internal server error: ${message}`, { status: 500 });
  }
}
