import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stripe, createStripeCustomer, createSubscription } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { priceId, paymentMethodId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId: string = user.stripeCustomerId || '';
    if (!customerId) {
      if (!user.email) {
        return NextResponse.json(
          { error: 'User email is required' },
          { status: 400 }
        );
      }
      const customer = await createStripeCustomer(
        user.email,
        user.name || undefined
      );
      customerId = customer.id;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Attach payment method if provided
    if (paymentMethodId && stripe) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create subscription
    const subscription = await createSubscription(customerId, priceId);

    // Determine tier from price
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }
    const price = await stripe.prices.retrieve(priceId);
    const tier = price.recurring?.interval === 'year'
      ? 'PREMIUM_ANNUAL'
      : 'PREMIUM_MONTHLY';

    // Save subscription to database
    const subData = subscription as any;
    await prisma.subscription.create({
      data: {
        userId: user.id,
        tier: tier as any,
        status: 'TRIALING',
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        currentPeriodStart: subData.current_period_start 
          ? new Date(subData.current_period_start * 1000)
          : new Date(),
        currentPeriodEnd: subData.current_period_end
          ? new Date(subData.current_period_end * 1000)
          : new Date(),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: tier as any,
        subscriptionStatus: 'TRIALING',
        stripeSubscriptionId: subscription.id,
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret: subData.latest_invoice?.payment_intent?.client_secret,
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

