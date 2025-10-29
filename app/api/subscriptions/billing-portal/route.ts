import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/db';
import { createBillingPortalSession } from '@/app/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user || !user.subscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Create billing portal session
    const { url } = req;
    const baseUrl = new URL(url).origin;
    const returnUrl = `${baseUrl}/dashboard`;

    const session = await createBillingPortalSession(
      user.subscription.stripeCustomerId,
      returnUrl
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
