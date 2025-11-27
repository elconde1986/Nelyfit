'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function sendMessageToClient(clientId: string, coachId: string, content: string) {
  await requireAuth('COACH');
  
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { coach: true },
  });

  if (!client || client.coachId !== coachId) {
    throw new Error('Unauthorized');
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

export async function addCoachNote(clientId: string, coachId: string, message: string) {
  await requireAuth('COACH');
  
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { coach: true },
  });

  if (!client || client.coachId !== coachId) {
    throw new Error('Unauthorized');
  }

  return await prisma.coachNote.create({
    data: {
      clientId,
      coachId,
      message: message.trim(),
      autoSuggested: false,
      resolved: false,
    },
  });
}

export async function sendNudge(clientId: string, coachId: string, nudgeType: string) {
  await requireAuth('COACH');
  
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { coach: true },
  });

  if (!client || client.coachId !== coachId) {
    throw new Error('Unauthorized');
  }

  const nudgeMessages: Record<string, string> = {
    streak_drop: 'Hey! I noticed your streak dropped. Let\'s get back on track! 💪',
    low_adherence: 'I see you\'ve been missing some workouts. How can I help?',
    inactivity: 'Haven\'t seen activity in a while. Everything okay?',
    milestone: 'Congratulations on your progress! Keep it up! 🎉',
  };

  const message = nudgeMessages[nudgeType] || 'Keep up the great work!';

  // Create notification
  await prisma.notification.create({
    data: {
      clientId,
      coachId,
      type: 'NUDGE',
      title: 'Coach Nudge',
      body: message,
    },
  });

  // Send message
  return await prisma.chatMessage.create({
    data: {
      clientId,
      coachId,
      sender: 'COACH',
      content: message,
    },
  });
}

