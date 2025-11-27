import { prisma } from './prisma';
import { TemporaryCodeType, SubscriptionTier } from '@prisma/client';

export async function checkTemporaryCode(code: string) {
  const tempCode = await prisma.temporaryCode.findUnique({
    where: { code },
  });

  if (!tempCode) {
    return { valid: false, error: 'Invalid code' };
  }

  if (new Date() > tempCode.expiresAt) {
    return { valid: false, error: 'Code has expired' };
  }

  if (tempCode.usedCount >= tempCode.maxUses) {
    return { valid: false, error: 'Code has reached maximum uses' };
  }

  return {
    valid: true,
    code: tempCode,
  };
}

export async function redeemTemporaryCode(
  code: string,
  userId: string
): Promise<{ success: boolean; trialDays?: number; error?: string }> {
  const checkResult = await checkTemporaryCode(code);
  
  if (!checkResult.valid) {
    return { success: false, error: checkResult.error };
  }

  const tempCode = checkResult.code!;

  // Check if user already redeemed this code
  const existing = await prisma.temporaryCodeRedemption.findUnique({
    where: {
      codeId_userId: {
        codeId: tempCode.id,
        userId,
      },
    },
  });

  if (existing) {
    return { success: false, error: 'Code already redeemed' };
  }

  // Create redemption
  await prisma.temporaryCodeRedemption.create({
    data: {
      codeId: tempCode.id,
      userId,
    },
  });

  // Update code usage count
  await prisma.temporaryCode.update({
    where: { id: tempCode.id },
    data: {
      usedCount: {
        increment: 1,
      },
    },
  });

  // Apply tier and trial if applicable
  if (tempCode.type === 'TRIAL_CODE' && tempCode.trialDays) {
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + tempCode.trialDays);

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tempCode.assignedTier,
        subscriptionStatus: 'TRIALING',
        trialStart,
        trialEnd,
      },
    });

    return { success: true, trialDays: tempCode.trialDays };
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tempCode.assignedTier,
      },
    });

    return { success: true };
  }
}

export async function createTemporaryCode(
  type: TemporaryCodeType,
  expiresAt: Date,
  maxUses: number = 1,
  assignedTier: SubscriptionTier = SubscriptionTier.PREMIUM_MONTHLY,
  trialDays?: number,
  createdById?: string
): Promise<string> {
  // Generate unique code
  const code = generateCode();
  
  await prisma.temporaryCode.create({
    data: {
      code,
      type,
      expiresAt,
      maxUses,
      assignedTier,
      trialDays,
      createdById,
    },
  });

  return code;
}

function generateCode(): string {
  // Generate 8-character alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

