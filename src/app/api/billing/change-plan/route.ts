import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stripe, updateSubscription } from '@/lib/stripe';
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

    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    if (!user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Update subscription in Stripe
    const subscription = await updateSubscription(user.stripeSubscriptionId, priceId);

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

    // Update database
    const subData = subscription as any;
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: user.stripeSubscriptionId },
      data: {
        tier: tier as any,
        stripePriceId: priceId,
        currentPeriodStart: subData.current_period_start
          ? new Date(subData.current_period_start * 1000)
          : undefined,
        currentPeriodEnd: subData.current_period_end
          ? new Date(subData.current_period_end * 1000)
          : undefined,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: tier as any,
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error: any) {
    console.error('Change plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

