// Client-safe Stripe utilities - NO server secrets
// Server-only Stripe operations are in stripe.server.ts

import Stripe from 'stripe';

// Lazy-initialized Stripe client to avoid build-time errors
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-10-29.clover' as any,
    });
  }
  return stripeClient;
}

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Only warn in development, not during build
if (typeof window !== 'undefined' && !STRIPE_PUBLISHABLE_KEY) {
  console.warn(
    '[Stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Frontend Stripe features may not work.'
  );
}

export const STRIPE_CONFIG = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
};

// ===========================================
// SOVRYN SUBSCRIPTION TIERS
// "The AI That Doesn't Say No"
// ===========================================

export const SUBSCRIPTION_PLANS = {
  STARTER: {
    name: 'Starter',
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    maxMessages: 1000,
    tagline: 'ChatGPT without the nanny',
    features: [
      '1,000 messages per month',
      'Uncensored responses',
      'No content restrictions',
      'GPT-4, Claude 3, Mixtral',
      'Conversation history',
      'Email support',
    ],
    models: [
      'gpt-4-turbo-preview',
      'gpt-3.5-turbo',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'mixtral-8x7b-32768',
    ],
    highlight: false,
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 79,
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    maxMessages: -1, // Unlimited
    tagline: 'For those who need real answers',
    features: [
      'Unlimited messages',
      'All uncensored models',
      'Priority response speed',
      'GPT-4, Claude 3 Opus, Groq',
      'PRIMEX AI clones',
      'Export & API access',
      'Priority support',
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
    highlight: true, // Most popular
  },
  SOVEREIGN: {
    name: 'Sovereign',
    price: 299,
    priceId: process.env.STRIPE_SOVEREIGN_PRICE_ID,
    maxMessages: -1,
    tagline: '100% local, zero cloud',
    features: [
      'Everything in Professional',
      'Local deployment option',
      'Your hardware, your data',
      'Zero cloud dependency',
      'Custom model fine-tuning',
      'White-label available',
      'Dedicated support channel',
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
    highlight: false,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 999,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    maxMessages: -1,
    tagline: 'HIPAA-ready, compliance-first',
    features: [
      'Everything in Sovereign',
      'HIPAA compliance pathway',
      'BAA available',
      'SOC 2 documentation',
      'Dedicated infrastructure',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated account manager',
      'On-call support',
    ],
    models: [
      'primex-ultra',
      'primex-architect',
      'primex-cortex',
      'primex-sovereign',
      'primex-enterprise',
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
    highlight: false,
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
  return await getStripe().customers.create({
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
  return await getStripe().subscriptions.create({
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
  return await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
