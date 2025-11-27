'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function createTemplate(
  data: {
    name: string;
    description: string;
    goal: string;
    weeks: number;
    visibility: 'PRIVATE' | 'TEAM' | 'PUBLIC';
    days: Array<{
      dayIndex: number;
      title: string;
      workoutRole: string;
      isRestDay: boolean;
      notes: string;
    }>;
  },
  coachId: string
) {
  await requireAuth('COACH');

  if (!data.name.trim()) {
    throw new Error('Template name is required');
  }

  const template = await prisma.programTemplate.create({
    data: {
      name: data.name,
      description: data.description || null,
      goal: data.goal || null,
      weeks: data.weeks,
      visibility: data.visibility,
      ownerId: coachId,
      days: {
        create: data.days.map((day) => ({
          dayIndex: day.dayIndex,
          title: day.title,
          workoutRole: day.workoutRole as any,
          isRestDay: day.isRestDay,
          notes: day.notes || null,
        })),
      },
    },
  });

  return template;
}

