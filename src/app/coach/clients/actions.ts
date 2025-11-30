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

