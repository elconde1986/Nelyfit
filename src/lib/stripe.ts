import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null as any;

export async function createStripeCustomer(email: string, name?: string) {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.customers.create({
    email,
    name,
  });
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays?: number
) {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialDays,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' as any },
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function updateSubscription(
  subscriptionId: string,
  priceId: string
) {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: (await stripe.subscriptions.retrieve(subscriptionId)).items.data[0].id,
        price: priceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  customerId?: string
) {
  if (!stripe) throw new Error('Stripe not configured');
  return await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'always',
    },
  });
}

