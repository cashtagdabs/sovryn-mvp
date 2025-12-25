// Client-safe Stripe utilities - NO server secrets
// Server-only Stripe operations are in stripe.server.ts

import Stripe from 'stripe';

// Initialize Stripe with server secret (only use in server-side code)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn(
    '[Stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Frontend Stripe features may not work.'
  );
}

export const STRIPE_CONFIG = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
};

// Subscription tiers
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: null,
    maxMessages: 100,
    features: [
      '100 messages per month',
      'PRIMEX Ultra AI',
      'GPT-3.5 Turbo',
      'Basic support',
      'Conversation history'
    ],
    models: [
      'gpt-3.5-turbo',
      'primex-ultra',
      'primex-architect',
      'primex-cortex',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 20,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    maxMessages: -1, // Unlimited
    features: [
      'Unlimited messages',
      'PRIMEX Ultra AI',
      'GPT-4, Claude 3, Groq',
      'Priority support',
      'Advanced features',
      'Export conversations'
    ],
    models: [
      'primex-ultra',
      'primex-architect',
      'primex-cortex',
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'mixtral-8x7b-32768',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    maxMessages: -1,
    features: [
      'Everything in Pro',
      'Claude 3 Opus',
      'Priority model access',
      'Custom integrations',
      'Dedicated support',
      'Usage analytics'
    ],
    models: [
      'primex-ultra',
      'primex-architect',
      'primex-cortex',
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'mixtral-8x7b-32768',
      'llama2-70b-4096',
    ],
  },
  SOVEREIGN: {
    name: 'Sovereign',
    price: 499,
    priceId: process.env.STRIPE_SOVEREIGN_PRICE_ID,
    maxMessages: -1,
    features: [
      'Everything in Enterprise',
      'PRIMEX AI access',
      'Custom model training',
      'White-label options',
      'API access',
      'Dedicated infrastructure'
    ],
    models: [
      'primex-ultra',
      'primex-architect',
      'primex-cortex',
      'primex-sovereign',
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'mixtral-8x7b-32768',
      'llama2-70b-4096',
      'llama2-7b-uncensored:q4_0',
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;

export function getPlanFromPriceId(priceId: string): SubscriptionTier | null {
  for (const [tier, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.priceId === priceId) {
      return tier as SubscriptionTier;
    }
  }
  return null;
}

export function canUseModel(userPlan: SubscriptionTier, modelId: string): boolean {
  const plan = SUBSCRIPTION_PLANS[userPlan];
  return (plan.models as readonly string[]).includes(modelId);
}

export async function createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      createdAt: new Date().toISOString(),
    },
  });
}

export async function createSubscription(
  customerId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
