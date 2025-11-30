import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/users/[userId]/deactivate - Deactivate user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const admin = await requireAuth('ADMIN');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent admin from deactivating themselves
    if (params.userId === admin.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Safety check: Prevent deactivating last active admin
    if (currentUser.role === 'ADMIN' && currentUser.status === 'ACTIVE') {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot deactivate the last active admin' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { status: 'INACTIVE' },
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
        newStatus: 'INACTIVE',
      },
      ...metadata,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error deactivating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to deactivate user' },
      { status: 500 }
    );
  }
}

