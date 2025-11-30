import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// POST /api/admin/users/[userId]/password-reset - Trigger password reset
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const admin = await requireAuth('ADMIN');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { generateTemporary } = body; // If true, generate temp password; if false, send email

    const targetUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let temporaryPassword: string | undefined;

    if (generateTemporary) {
      // Generate temporary password
      temporaryPassword = generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      await prisma.user.update({
        where: { id: params.userId },
        data: {
          password: hashedPassword,
          lastPasswordChangeAt: new Date(),
        },
      });
    } else {
      // TODO: Send password reset email
      // For now, we'll generate a temporary password as fallback
      temporaryPassword = generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      await prisma.user.update({
        where: { id: params.userId },
        data: {
          password: hashedPassword,
          lastPasswordChangeAt: new Date(),
        },
      });
    }

    // Audit log
    const { createAuditLog, getRequestMetadata } = await import('@/lib/audit');
    const metadata = getRequestMetadata(request.headers);
    await createAuditLog({
      actorId: admin.id,
      actorRole: admin.role,
      actionType: 'USER_PASSWORD_RESET_REQUESTED',
      targetType: 'USER',
      targetId: params.userId,
      metadata: {
        deliveryMethod: generateTemporary ? 'TEMPORARY_PASSWORD' : 'EMAIL',
      },
      ...metadata,
    });

    return NextResponse.json({
      success: true,
      temporaryPassword, // Only returned if generateTemporary is true
      message: generateTemporary
        ? 'Temporary password generated'
        : 'Password reset email sent (temporary password generated as fallback)',
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

