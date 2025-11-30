import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/users/[userId]/reactivate - Reactivate user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const admin = await requireAuth('ADMIN');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    // Audit log
    const { createAuditLog, getRequestMetadata } = await import('@/lib/audit');
    const metadata = getRequestMetadata(request.headers);
    await createAuditLog({
      actorId: admin.id,
      actorRole: admin.role,
      actionType: 'USER_STATUS_UPDATED',
      targetType: 'USER',
      targetId: params.userId,
      metadata: {
        oldStatus: currentUser.status,
        newStatus: 'ACTIVE',
      },
      ...metadata,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error reactivating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reactivate user' },
      { status: 500 }
    );
  }
}

