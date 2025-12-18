import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma, getOrCreateUser } from '@/app/lib/db';

// POST - Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, firstMessage } = body;

    // Get or create user
    const user = await getOrCreateUser(userId);

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: title || 'New Conversation',
        model: 'PRIMEX',
      },
    });

    // Add first message if provided
    if (firstMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          userId: user.id,
          role: 'user',
          content: firstMessage,
          model: 'PRIMEX',
        },
      });
    }

    return NextResponse.json({ conversation });
  } catch (error: any) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List all conversations
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: user.id,
        isArchived: false,
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        isPinned: true,
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
