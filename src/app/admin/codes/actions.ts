'use server';

import { requireAuth } from '@/lib/auth';
import { createTemporaryCode } from '@/lib/temporary-codes';
import { TemporaryCodeType, SubscriptionTier } from '@prisma/client';

export async function createTemporaryCodeAction(data: {
  type: TemporaryCodeType;
  expiresAt: Date;
  maxUses: number;
  trialDays?: number;
  assignedTier: SubscriptionTier;
  createdById: string;
}): Promise<string> {
  await requireAuth('ADMIN');
  
  return await createTemporaryCode(
    data.type,
    data.expiresAt,
    data.maxUses,
    data.assignedTier,
    data.trialDays,
    data.createdById
  );
}

