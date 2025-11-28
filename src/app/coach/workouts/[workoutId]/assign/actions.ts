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

    // Get the client's user ID (WorkoutSession.clientId references User.id)
    const clientUser = await prisma.user.findUnique({
      where: { id: data.clientId },
      include: { client: true },
    });

    if (!clientUser || !clientUser.client) {
      return { success: false, error: 'Client user not found' };
    }

    // Create WorkoutSession records for each date
    const sessions = [];
    for (const date of dates) {
      // Check if session already exists for this date
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      const existingSession = await prisma.workoutSession.findFirst({
        where: {
          clientId: clientUser.id,
          workoutId: workout.id,
          dateTimeStarted: {
            gte: dateStart,
            lt: dateEnd,
          },
        },
      });

      if (!existingSession) {
        const scheduledDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0);
        const session = await prisma.workoutSession.create({
          data: {
            clientId: clientUser.id,
            workoutId: workout.id,
            status: 'IN_PROGRESS', // Use IN_PROGRESS for scheduled workouts that haven't started yet
            dateTimeStarted: scheduledDateTime, // Use dateTimeStarted for scheduled time
          },
        });
        sessions.push(session);
      }
    }

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

    return { success: true, sessionsCreated: sessions.length };
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

