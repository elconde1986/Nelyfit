'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function updateProgramStructure(
  programId: string,
  weeks: Array<{
    id: string;
    weekNumber: number;
    title?: string | null;
    weekFocus?: string | null;
    days: Array<{
      id?: string;
      dayIndex: number;
      title: string;
      workoutId?: string | null;
      isRestDay: boolean;
      notes?: string | null;
      intensityOverride?: string | null;
      tags?: string[];
    }>;
  }>
) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program || (program.coachId !== user.id && user.role !== 'ADMIN')) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update weeks and days
    for (const week of weeks) {
      await prisma.programWeek.update({
        where: { id: week.id },
        data: {
          title: week.title,
          weekFocus: week.weekFocus,
        },
      });

      for (const day of week.days) {
        if (day.id) {
          await prisma.programDay.upsert({
            where: { id: day.id },
            update: {
              title: day.title,
              workoutId: day.workoutId,
              isRestDay: day.isRestDay,
              notes: day.notes,
              intensityOverride: day.intensityOverride,
              tags: day.tags || [],
            },
            create: {
              programId,
              programWeekId: week.id,
              dayIndex: day.dayIndex,
              title: day.title,
              workoutId: day.workoutId,
              isRestDay: day.isRestDay,
              notes: day.notes,
              intensityOverride: day.intensityOverride,
              tags: day.tags || [],
            },
          });
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating program structure:', error);
    return { success: false, error: error.message || 'Failed to update program' };
  }
}

export async function assignWorkoutToDay(data: {
  programId: string;
  weekNumber: number;
  dayIndex: number;
  workoutId: string | null;
}) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const program = await prisma.program.findUnique({
      where: { id: data.programId },
      include: {
        weeks: {
          where: { weekNumber: data.weekNumber },
          include: {
            days: true,
          },
        },
      },
    });

    if (!program || (program.coachId !== user.id && user.role !== 'ADMIN')) {
      return { success: false, error: 'Unauthorized' };
    }

    const week = program.weeks[0];
    if (!week) {
      return { success: false, error: 'Week not found' };
    }

    // Find or create day
    let day = week.days.find((d) => d.dayIndex === data.dayIndex);

    if (day) {
      await prisma.programDay.update({
        where: { id: day.id },
        data: {
          workoutId: data.workoutId,
          isRestDay: !data.workoutId,
        },
      });
    } else {
      await prisma.programDay.create({
        data: {
          programId: data.programId,
          programWeekId: week.id,
          dayIndex: data.dayIndex,
          title: `Day ${data.dayIndex}`,
          workoutId: data.workoutId,
          isRestDay: !data.workoutId,
        },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error assigning workout to day:', error);
    return { success: false, error: error.message || 'Failed to assign workout' };
  }
}

