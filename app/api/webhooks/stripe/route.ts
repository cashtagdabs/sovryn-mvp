import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe, getPlanFromPriceId } from '@/app/lib/stripe';
import { prisma } from '@/app/lib/db';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed:`, error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) return;

  const plan = getPlanFromPriceId(priceId);
  if (!plan) return;

  // Find user by Stripe customer ID
  const userSubscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (userSubscription) {
    await prisma.subscription.update({
      where: { stripeCustomerId: customerId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        plan: plan as any,
        status: subscription.status.toUpperCase() as any,
      },
    });
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await prisma.subscription.update({
    where: { stripeCustomerId: customerId },
    data: {
      status: 'CANCELED',
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Update subscription to active if payment succeeded
  await prisma.subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: { status: 'ACTIVE' },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Update subscription status to past due
  await prisma.subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: { status: 'PAST_DUE' },
  });
}
