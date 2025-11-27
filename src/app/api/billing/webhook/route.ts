import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'SUCCEEDED',
      stripePaymentIntentId: invoice.payment_intent,
      stripeInvoiceId: invoice.id,
    },
  });

  if (subscriptionId) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: 'ACTIVE' },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: 'ACTIVE' },
    });
  }
}

async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer;
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  await prisma.payment.create({
    data: {
      userId: user.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'FAILED',
      stripeInvoiceId: invoice.id,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: 'PAST_DUE' },
  });
}

async function handleSubscriptionUpdated(subscription: any) {
  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) return;

  const tier = subscription.items.data[0]?.price?.recurring?.interval === 'year'
    ? 'PREMIUM_ANNUAL'
    : 'PREMIUM_MONTHLY';

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      tier: tier as any,
      status: subscription.status.toUpperCase().replace(' ', '_') as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: tier as any,
      subscriptionStatus: subscription.status.toUpperCase().replace(' ', '_') as any,
    },
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) return;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'CANCELED' },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStatus: 'CANCELED',
    },
  });
}

