import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, UserStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET /api/admin/users/[userId] - Get user detail
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await requireAuth('ADMIN');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.userId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            currentProgramId: true,
          },
        },
        profile: true,
        _count: {
          select: {
            coachedClients: true,
            programs: true,
            workouts: true,
            workoutSessions: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = targetUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[userId] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const admin = await requireAuth('ADMIN');
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, status } = body;

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        email: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Safety check: Prevent removing last active admin
    if (role && role !== 'ADMIN' && currentUser.role === 'ADMIN') {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last active admin' },
          { status: 400 }
        );
      }
    }

    // Prevent admin from deactivating themselves
    if (status === 'INACTIVE' && params.userId === admin.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};
    const metadata: any = {};

    if (name !== undefined && name !== currentUser.name) {
      updateData.name = name;
      metadata.oldName = currentUser.name;
      metadata.newName = name;
    }

    if (role && role !== currentUser.role) {
      updateData.role = role;
      metadata.oldRole = currentUser.role;
      metadata.newRole = role;
    }

    if (status && status !== currentUser.status) {
      updateData.status = status;
      metadata.oldStatus = currentUser.status;
      metadata.newStatus = status;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        lastPasswordChangeAt: true,
      },
    });

    // Audit logging
    const { createAuditLog, getRequestMetadata } = await import('@/lib/audit');
    const requestMetadata = getRequestMetadata(request.headers);

    if (metadata.oldRole && metadata.newRole) {
      await createAuditLog({
        actorId: admin.id,
        actorRole: admin.role,
        actionType: 'USER_ROLE_UPDATED',
        targetType: 'USER',
        targetId: params.userId,
        metadata: {
          oldRole: metadata.oldRole,
          newRole: metadata.newRole,
        },
        ...requestMetadata,
      });
    }

    if (metadata.oldStatus && metadata.newStatus) {
      await createAuditLog({
        actorId: admin.id,
        actorRole: admin.role,
        actionType: 'USER_STATUS_UPDATED',
        targetType: 'USER',
        targetId: params.userId,
        metadata: {
          oldStatus: metadata.oldStatus,
          newStatus: metadata.newStatus,
        },
        ...requestMetadata,
      });
    }

    if (metadata.oldName && metadata.newName) {
      await createAuditLog({
        actorId: admin.id,
        actorRole: admin.role,
        actionType: 'USER_NAME_UPDATED',
        targetType: 'USER',
        targetId: params.userId,
        metadata: {
          oldName: metadata.oldName,
          newName: metadata.newName,
        },
        ...requestMetadata,
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

