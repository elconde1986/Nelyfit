'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function getMessages(clientId: string, coachId: string) {
  const user = await requireAuth('CLIENT');
  
  if (!user || user.clientId !== clientId) {
    throw new Error('Unauthorized');
  }

  const messages = await prisma.chatMessage.findMany({
    where: {
      clientId,
      coachId,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Mark coach messages as read
  await prisma.chatMessage.updateMany({
    where: {
      clientId,
      coachId,
      sender: 'COACH',
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return messages;
}

export async function sendMessage(clientId: string, coachId: string, content: string) {
  const user = await requireAuth('CLIENT');
  
  if (!user || user.clientId !== clientId) {
    throw new Error('Unauthorized');
  }

  if (!content.trim()) {
    throw new Error('Message cannot be empty');
  }

  return await prisma.chatMessage.create({
    data: {
      clientId,
      coachId,
      sender: 'CLIENT',
      content: content.trim(),
    },
  });
}

