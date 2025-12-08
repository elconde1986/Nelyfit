'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { headers } from 'next/headers';

export async function assignClientToCoach(clientId: string, coachId: string) {
  const coach = await requireAuth('COACH');
  if (!coach || coach.id !== coachId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Check if client exists and is not already assigned
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { coach: true },
    });

    if (!client) {
      return { success: false, error: 'Client not found' };
    }

    if (client.coachId) {
      return {
        success: false,
        error: client.coachId === coachId
          ? 'Client is already assigned to you'
          : 'Client is already assigned to another coach',
      };
    }

    // Assign client to coach
    await prisma.client.update({
      where: { id: clientId },
      data: { coachId },
    });

    // Audit log
    const headersList = await headers();
    const requestMetadata = {
      ipAddress: headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined,
      userAgent: headersList.get('user-agent') || undefined,
    };
    
    await createAuditLog({
      actorId: coachId,
      actorRole: 'COACH',
      actionType: 'PROGRAM_ASSIGNED_TO_CLIENT',
      targetType: 'Client',
      targetId: clientId,
      metadata: {
        action: 'client_assigned',
        clientName: client.name,
        clientEmail: client.email,
      },
      ...requestMetadata,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error assigning client to coach:', error);
    return { success: false, error: error.message || 'Failed to assign client' };
  }
}

export async function createClient(data: {
  name: string;
  email: string;
  phone?: string;
}) {
  const coach = await requireAuth('COACH');
  if (!coach) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Validation
    if (!data.name || !data.email) {
      return { success: false, error: 'Name and email are required' };
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, error: 'Email already in use' };
    }

    // Generate temporary password
    const bcrypt = await import('bcryptjs');
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.default.hash(temporaryPassword, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: 'CLIENT',
        status: 'ACTIVE',
        authProvider: 'EMAIL',
        emailVerified: false,
        lastPasswordChangeAt: new Date(),
      },
    });

    // Create client profile and assign to coach
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        userId: newUser.id,
        coachId: coach.id, // Automatically assign to the coach who created them
      },
    });

    // Link client to user
    await prisma.user.update({
      where: { id: newUser.id },
      data: { clientId: client.id },
    });

    // Create gamification profile
    await prisma.gamificationProfile.create({
      data: {
        clientId: client.id,
        xp: 0,
        level: 1,
        streakDays: 0,
        bestStreak: 0,
        totalWorkouts: 0,
        totalHabits: 0,
        badges: [],
      },
    });

    // Audit log
    const headersList = await headers();
    const requestMetadata = {
      ipAddress: headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || undefined,
      userAgent: headersList.get('user-agent') || undefined,
    };
    
    await createAuditLog({
      actorId: coach.id,
      actorRole: 'COACH',
      actionType: 'USER_CREATED',
      targetType: 'USER',
      targetId: newUser.id,
      metadata: {
        role: 'CLIENT',
        status: 'ACTIVE',
        clientName: data.name,
        clientEmail: data.email,
        createdBy: coach.id,
      },
      ...requestMetadata,
    });

    return {
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
      temporaryPassword,
    };
  } catch (error: any) {
    console.error('Error creating client:', error);
    return { success: false, error: error.message || 'Failed to create client' };
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

