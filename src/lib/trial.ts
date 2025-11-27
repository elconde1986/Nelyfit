import { prisma } from './prisma';
import { SubscriptionTier } from '@prisma/client';

export async function startTrial(
  userId: string,
  days: number = 7
): Promise<{ trialStart: Date; trialEnd: Date }> {
  const trialStart = new Date();
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + days);

  await prisma.user.update({
    where: { id: userId },
    data: {
      trialStart,
      trialEnd,
      subscriptionTier: SubscriptionTier.PREMIUM_MONTHLY,
      subscriptionStatus: 'TRIALING',
    },
  });

  return { trialStart, trialEnd };
}

export function isTrialActive(trialEnd: Date | null): boolean {
  if (!trialEnd) return false;
  return new Date() < trialEnd;
}

export function getTrialDaysRemaining(trialEnd: Date | null): number {
  if (!trialEnd || !isTrialActive(trialEnd)) return 0;
  const diff = trialEnd.getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function checkTrialExpiration(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialEnd: true, subscriptionStatus: true },
  });

  if (!user || !user.trialEnd) return;

  if (!isTrialActive(user.trialEnd) && user.subscriptionStatus === 'TRIALING') {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: SubscriptionTier.FREE,
        subscriptionStatus: 'CANCELED',
      },
    });
  }
}

