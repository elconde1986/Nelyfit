import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, UserStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET /api/admin/users - List users with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth('ADMIN');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') as Role | null;
    const status = searchParams.get('status') as UserStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          lastPasswordChangeAt: true,
          client: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              coachedClients: true,
              programs: true,
              workouts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth('ADMIN');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, status, sendWelcomeEmail } = body;

    // Validation
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Generate temporary password if not sending welcome email
    let password: string | undefined;
    let temporaryPassword: string | undefined;

    if (!sendWelcomeEmail) {
      // Generate a secure temporary password
      temporaryPassword = generateTemporaryPassword();
      const bcrypt = await import('bcryptjs');
      password = await bcrypt.default.hash(temporaryPassword, 10);
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role as Role,
        status: (status || 'PENDING') as UserStatus,
        password,
        emailVerified: false,
        authProvider: 'EMAIL',
        lastPasswordChangeAt: password ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Create client profile if role is CLIENT
    if (role === 'CLIENT') {
      const client = await prisma.client.create({
        data: {
          name,
          email,
          userId: newUser.id,
        },
      });

      await prisma.user.update({
        where: { id: newUser.id },
        data: { clientId: client.id },
      });
    }

    // Audit log
    const { createAuditLog, getRequestMetadata } = await import('@/lib/audit');
    const metadata = getRequestMetadata(request.headers);
    await createAuditLog({
      actorId: user.id,
      actorRole: user.role,
      actionType: 'USER_CREATED',
      targetType: 'USER',
      targetId: newUser.id,
      metadata: {
        role: newUser.role,
        status: newUser.status,
        createdBy: user.id,
      },
      ...metadata,
    });

    return NextResponse.json({
      user: newUser,
      temporaryPassword, // Only returned if not sending welcome email
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

function generateTemporaryPassword(): string {
  // Generate a secure 12-character password
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

