'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function assignWorkoutToClient(data: {
  workoutId: string;
  clientId: string;
  date: string;
  recurring?: boolean;
  recurringPattern?: string[];
  recurringWeeks?: number;
  sendNotification?: boolean;
  message?: string;
}) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify client belongs to coach
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
      include: { coach: true },
    });

    if (!client || client.coachId !== user.id) {
      return { success: false, error: 'Client not found or unauthorized' };
    }

    // Verify workout exists
    const workout = await prisma.workout.findUnique({
      where: { id: data.workoutId },
    });

    if (!workout) {
      return { success: false, error: 'Workout not found' };
    }

    const assignmentDate = new Date(data.date);
    const dates: Date[] = [assignmentDate];

    // Generate recurring dates if needed
    if (data.recurring && data.recurringPattern && data.recurringPattern.length > 0) {
      const dayMap: { [key: string]: number } = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      };

      const weeks = data.recurringWeeks || 4;
      for (let week = 0; week < weeks; week++) {
        for (const dayName of data.recurringPattern) {
          const dayOfWeek = dayMap[dayName];
          const date = new Date(assignmentDate);
          date.setDate(date.getDate() + week * 7 + (dayOfWeek - date.getDay()));
          if (date >= assignmentDate) {
            dates.push(date);
          }
        }
      }
    }

    // Create scheduled workout sessions
    // For now, we'll create a simple assignment record
    // In a full implementation, you'd create WorkoutSession records with scheduled dates
    // or use a separate ScheduledWorkout model

    // Create notification if requested
    if (data.sendNotification) {
      await prisma.notification.create({
        data: {
          clientId: data.clientId,
          type: 'GENERAL', // Use existing notification type
          title: 'New Workout Assigned',
          body: data.message || `You have a new workout: ${workout.name}`,
        },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error assigning workout to client:', error);
    return { success: false, error: error.message || 'Failed to assign workout' };
  }
}

export async function assignWorkoutToProgram(data: {
  workoutId: string;
  programId: string;
  dayIndex: number;
}) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify program belongs to coach
    const program = await prisma.program.findUnique({
      where: { id: data.programId },
      include: { coach: true },
    });

    if (!program || program.coachId !== user.id) {
      return { success: false, error: 'Program not found or unauthorized' };
    }

    // Verify workout exists
    const workout = await prisma.workout.findUnique({
      where: { id: data.workoutId },
    });

    if (!workout) {
      return { success: false, error: 'Workout not found' };
    }

    // Update or create program day
    await prisma.programDay.upsert({
      where: {
        programId_dayIndex: {
          programId: data.programId,
          dayIndex: data.dayIndex,
        },
      },
      update: {
        workoutId: data.workoutId,
      },
      create: {
        programId: data.programId,
        dayIndex: data.dayIndex,
        title: `Day ${data.dayIndex + 1}`,
        workoutId: data.workoutId,
      },
    });

    // Increment workout usage count
    await prisma.workout.update({
      where: { id: data.workoutId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error assigning workout to program:', error);
    return { success: false, error: error.message || 'Failed to assign workout' };
  }
}

