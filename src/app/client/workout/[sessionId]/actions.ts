'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function logSet(data: {
  sessionId: string;
  workoutExerciseId: string;
  setNumber: number;
  actualReps?: number | null;
  actualWeight?: number | null;
  feelingCode?: string | null;
  feelingEmoji?: string | null;
  feelingNote?: string | null;
}) {
  const user = await requireAuth('CLIENT');
  if (!user || !user.clientId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const session = await prisma.workoutSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session || session.clientId !== user.clientId) {
      return { success: false, error: 'Unauthorized' };
    }

    const workoutExercise = await prisma.workoutExercise.findUnique({
      where: { id: data.workoutExerciseId },
      include: { block: { include: { section: { include: { workout: true } } } } },
    });

    // Upsert set log
    await prisma.exerciseSetLog.upsert({
      where: {
        sessionId_workoutExerciseId_setNumber: {
          sessionId: data.sessionId,
          workoutExerciseId: data.workoutExerciseId,
          setNumber: data.setNumber,
        },
      },
      create: {
        sessionId: data.sessionId,
        workoutExerciseId: data.workoutExerciseId,
        exerciseName: workoutExercise?.name || 'Exercise',
        setNumber: data.setNumber,
        targetReps: (workoutExercise?.targetRepsBySet as number[])?.[data.setNumber - 1] || 0,
        targetWeight: (workoutExercise?.targetWeightBySet as (number | null)[])?.[data.setNumber - 1] || null,
        actualReps: data.actualReps || null,
        actualWeight: data.actualWeight || null,
        feelingCode: data.feelingCode as any,
        feelingEmoji: data.feelingEmoji || null,
        feelingNote: data.feelingNote || null,
      },
      update: {
        actualReps: data.actualReps !== undefined ? data.actualReps : undefined,
        actualWeight: data.actualWeight !== undefined ? data.actualWeight : undefined,
        feelingCode: data.feelingCode as any,
        feelingEmoji: data.feelingEmoji || undefined,
        feelingNote: data.feelingNote || undefined,
      },
    });

    // If pain reported, create coach note and notification
    if (data.feelingCode === 'PAIN' && workoutExercise) {
      const coachId = workoutExercise.block.section.workout.coachId;
      if (coachId) {
        await prisma.coachNote.create({
          data: {
            clientId: user.clientId,
            coachId,
            message: `Pain reported during ${workoutExercise.name} - Set ${data.setNumber}. ${data.feelingNote || ''}`,
            autoSuggested: true,
            resolved: false,
          },
        });

        await prisma.notification.create({
          data: {
            clientId: user.clientId,
            coachId,
            type: 'SYSTEM',
            title: 'Pain Reported',
            body: `${workoutExercise.name} - Set ${data.setNumber}`,
          },
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error logging set:', error);
    return { success: false, error: error.message || 'Failed to log set' };
  }
}

export async function completeSession(sessionId: string) {
  const user = await requireAuth('CLIENT');
  if (!user || !user.clientId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
      include: {
        setLogs: true,
      },
    });

    if (!session || session.clientId !== user.clientId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Calculate duration
    const duration = session.dateTimeStarted
      ? Math.floor((new Date().getTime() - session.dateTimeStarted.getTime()) / 1000)
      : 0;

    await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        dateTimeCompleted: new Date(),
      },
    });

    // Update gamification (XP, streak, badges)
    const client = await prisma.client.findUnique({
      where: { id: user.clientId },
      include: { gamification: true },
    });

    if (client) {
      const baseXP = 50;
      const setsCompleted = session.setLogs.length;
      const bonusXP = setsCompleted * 5;
      const totalXP = baseXP + bonusXP;

      // Update or create gamification profile
      if (client.gamification) {
        await prisma.gamificationProfile.update({
          where: { id: client.gamification.id },
          data: {
            xp: { increment: totalXP },
            streakDays: { increment: 1 },
            lastActiveDate: new Date(),
            totalWorkouts: { increment: 1 },
          },
        });
      } else {
        await prisma.gamificationProfile.create({
          data: {
            clientId: client.id,
            xp: totalXP,
            level: 1,
            streakDays: 1,
            lastActiveDate: new Date(),
            totalWorkouts: 1,
          },
        });
      }

      // Check for badge unlocks (simplified - in real app, this would be more sophisticated)
      // This is a placeholder - actual badge logic would check various criteria
    }

    return { success: true, xpGained: 50 };
  } catch (error: any) {
    console.error('Error completing session:', error);
    return { success: false, error: error.message || 'Failed to complete session' };
  }
}

