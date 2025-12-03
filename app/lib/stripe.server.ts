import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe() {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not set');
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-10-29.clover' as any,
            typescript: true,
        });
    }
    return stripeInstance;
}

export const STRIPE_SECRETS = {
    secretKey: process.env.STRIPE_SECRET_KEY || null,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,
};

export async function createCustomer(email: string, name?: string) {
    return await getStripe().customers.create({ email, name });
}

export async function createSubscription(customerId: string, priceId: string) {
    return await getStripe().subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
    });
}

export async function createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
) {
    return await getStripe().checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
    });
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
    return await getStripe().billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
}

export function getStripeClient() {
    return getStripe();
}
