import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { createBillingPortalSession } from '@/app/lib/stripe.server';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { Subscription: true },
    });

    if (!user || !user.Subscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Create billing portal session
    const { url } = req;
    const baseUrl = new URL(url).origin;
    const returnUrl = `${baseUrl}/dashboard`;

    const session = await createBillingPortalSession(
      user.Subscription.stripeCustomerId,
      returnUrl
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred in billing-portal handler';

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: message,
      },
      { status: 500 }
    );
  }
}
