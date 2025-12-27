import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { getUserUsage } from '@/app/lib/usage';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { Subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get usage statistics
    const usage = await getUserUsage(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      subscription: user.Subscription ? {
        plan: user.Subscription.plan,
        status: user.Subscription.status,
        currentPeriodEnd: user.Subscription.stripeCurrentPeriodEnd,
      } : null,
      usage,
    });
  } catch (error) {
    console.error('User usage API error:', error);

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred in user/usage handler';

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: message,
      },
      { status: 500 }
    );
  }
}
