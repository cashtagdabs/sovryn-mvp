import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'recent';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('q');

    // Build where clause
    const where: any = {
      isPublic: true,
    };

    // Add search if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        {
          Message: {
            some: {
              content: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };

    if (sort === 'trending') {
      // For trending, we'll fetch and sort in memory
      // (SQLite doesn't support complex expressions in ORDER BY)
      orderBy = { viewCount: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { likeCount: 'desc' };
    }

    // Fetch conversations
    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        User: {
          select: {
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        Message: {
          take: 2,
          orderBy: { createdAt: 'asc' },
          select: {
            role: true,
            content: true,
          },
        },
        _count: {
          select: {
            Message: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const total = await prisma.conversation.count({ where });

    // Format response
    const formatted = conversations.map((conv) => ({
      id: conv.id,
      shareId: conv.shareId,
      title: conv.title,
      preview: conv.Message[0]?.content.substring(0, 150) + '...',
      author: {
        name: conv.User.name || conv.User.username || 'Anonymous',
        avatar: conv.User.avatarUrl,
      },
      stats: {
        views: conv.viewCount,
        likes: conv.likeCount,
        messages: conv._count.Message,
      },
      createdAt: conv.createdAt,
    }));

    return NextResponse.json({
      conversations: formatted,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('Gallery API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
