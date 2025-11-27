'use server';

import { prisma } from '@/lib/prisma';
import { updateGamificationForToday } from '@/lib/gamification';

const DEMO_CLIENT_EMAIL = 'client@nelyfit.demo';

async function getDemoClient() {
  const client = await prisma.client.findFirst({
    where: { email: DEMO_CLIENT_EMAIL },
  });
  if (!client) {
    throw new Error('Demo client not found. Run prisma seed.');
  }
  return client;
}

export async function toggleWorkoutDone() {
  const client = await getDemoClient();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let log = await prisma.completionLog.findFirst({
    where: {
      clientId: client.id,
      date: {
        gte: start,
        lt: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1),
      },
    },
  });

  if (!log) {
    log = await prisma.completionLog.create({
      data: {
        clientId: client.id,
        date: start,
        workoutCompleted: true,
        habitsCompleted: [],
      },
    });
  } else {
    log = await prisma.completionLog.update({
      where: { id: log.id },
      data: { workoutCompleted: !log.workoutCompleted },
    });
  }

  const gamification = await updateGamificationForToday(client.id);
  return gamification;
}

export async function toggleHabitDone(habitId: string) {
  const client = await getDemoClient();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let log = await prisma.completionLog.findFirst({
    where: {
      clientId: client.id,
      date: {
        gte: start,
        lt: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1),
      },
    },
  });

  if (!log) {
    log = await prisma.completionLog.create({
      data: {
        clientId: client.id,
        date: start,
        workoutCompleted: false,
        habitsCompleted: [habitId],
      },
    });
  } else {
    const habits = new Set(log.habitsCompleted);
    if (habits.has(habitId)) {
      habits.delete(habitId);
    } else {
      habits.add(habitId);
    }
    log = await prisma.completionLog.update({
      where: { id: log.id },
      data: { habitsCompleted: Array.from(habits) },
    });
  }

  const gamification = await updateGamificationForToday(client.id);
  return gamification;
}
