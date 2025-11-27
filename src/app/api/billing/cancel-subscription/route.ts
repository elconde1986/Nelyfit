import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stripe, cancelSubscription } from '@/lib/stripe';
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

    if (!user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Cancel subscription in Stripe
    await cancelSubscription(user.stripeSubscriptionId);

    // Update database
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: user.stripeSubscriptionId },
      data: {
        status: 'CANCELED',
        cancelAtPeriodEnd: true,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'CANCELED',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

