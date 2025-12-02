import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/db';
import { stripe, createCustomer, createSubscription, SUBSCRIPTION_PLANS } from '@/app/lib/stripe';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  plan: z.enum(['PRO', 'ENTERPRISE', 'SOVEREIGN']),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = createSubscriptionSchema.parse(body);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    if (user.subscription && user.subscription.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    const selectedPlan = SUBSCRIPTION_PLANS[plan];
    if (!selectedPlan.priceId) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    let customerId = user.subscription?.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await createCustomer(user.email, user.name || undefined);
      customerId = customer.id;

      // Update or create subscription record
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

    // Create Stripe subscription
    const subscription = await createSubscription(customerId, selectedPlan.priceId);

    // Update database with subscription details
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: selectedPlan.priceId,
        plan: plan,
        status: 'INCOMPLETE',
      },
    });

    // Return client secret for payment
    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
      status: subscription.status,
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
