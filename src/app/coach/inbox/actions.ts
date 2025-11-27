'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function getMessages(clientId: string, coachId: string) {
  await requireAuth('COACH');
  
  const messages = await prisma.chatMessage.findMany({
    where: {
      clientId,
      coachId,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Mark messages as read
  await prisma.chatMessage.updateMany({
    where: {
      clientId,
      coachId,
      sender: 'CLIENT',
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return messages;
}

export async function sendMessage(clientId: string, coachId: string, content: string) {
  await requireAuth('COACH');
  
  if (!content.trim()) {
    throw new Error('Message cannot be empty');
  }

  return await prisma.chatMessage.create({
    data: {
      clientId,
      coachId,
      sender: 'COACH',
      content: content.trim(),
    },
  });
}

