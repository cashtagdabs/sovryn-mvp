import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { createCustomer, createCheckoutSession } from '@/app/lib/stripe.server';
import { SUBSCRIPTION_PLANS } from '@/app/lib/stripe';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  plan: z.enum(['PRO', 'ENTERPRISE', 'SOVEREIGN']),
});

export async function POST(req: NextRequest) {
  try {
    // Use getUserId which supports the dev header `x-dev-clerk-id` in non-production
    const userId = await getUserId(req);
    if (!userId) {
      console.error('Auth failed in subscriptions/create - no userId');
      return NextResponse.json({ error: 'Unauthorized - please sign in' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = createSubscriptionSchema.parse(body);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { Subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Allow upgrades from FREE to paid plans; block downgrades/re-purchases
    if (user.Subscription?.status === 'ACTIVE' && user.Subscription.plan !== 'FREE') {
      return NextResponse.json(
        { error: 'User already has an active paid subscription' },
        { status: 400 }
      );
    }

    const selectedPlan = SUBSCRIPTION_PLANS[plan];
    if (!selectedPlan.priceId) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    let customerId = user.Subscription?.stripeCustomerId;

    // Create or recreate Stripe customer if doesn't exist or is a test mock
    if (!customerId || customerId.startsWith('test_')) {
      console.log(`[Subscription] Creating real Stripe customer for ${user.email}...`);
      const customer = await createCustomer(user.email, user.name || undefined);
      customerId = customer.id;
      console.log(`[Subscription] New Stripe customer: ${customerId}`);

      // Update subscription record with real customer ID
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { stripeCustomerId: customerId },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          plan: 'FREE',
          status: 'ACTIVE',
        },
      });
    }

    // Create Stripe checkout session (hosted checkout is better UX than client secret flow)
    console.log(`[Subscription] Creating Stripe checkout session for customer ${customerId}, plan ${plan}...`);

    const origin = req.nextUrl.origin;
    const successUrl = `${origin}/dashboard?status=subscription_success&plan=${plan}`;
    const cancelUrl = `${origin}/subscription?status=checkout_canceled`;

    const checkoutSession = await createCheckoutSession(
      customerId,
      selectedPlan.priceId,
      successUrl,
      cancelUrl
    );

    // Update database with subscription pending state
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        plan: plan,
        status: 'INCOMPLETE',
        stripePriceId: selectedPlan.priceId,
      },
    });

    console.log(`[Subscription] Checkout session created: ${checkoutSession.id}, url: ${checkoutSession.url}`);

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Create subscription error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred in subscription handler';

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: message,
      },
      { status: 500 }
    );
  }
}
