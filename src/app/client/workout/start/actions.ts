'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function startWorkoutSession(data: {
  clientId: string;
  workoutId: string;
  programDayId?: string;
}) {
  const user = await requireAuth('CLIENT');
  if (!user || !user.clientId || user.clientId !== data.clientId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Check if workout exists
    const workout = await prisma.workout.findUnique({
      where: { id: data.workoutId },
    });

    if (!workout) {
      return { success: false, error: 'Workout not found' };
    }

    // Create workout session
    const session = await prisma.workoutSession.create({
      data: {
        clientId: data.clientId,
        workoutId: data.workoutId,
        programDayId: data.programDayId,
        dateTimeStarted: new Date(),
        status: 'IN_PROGRESS',
      },
    });

    return { success: true, sessionId: session.id };
  } catch (error: any) {
    console.error('Error starting workout session:', error);
    return { success: false, error: error.message || 'Failed to start workout session' };
  }
}

