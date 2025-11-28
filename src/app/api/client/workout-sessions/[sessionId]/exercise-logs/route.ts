import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await requireAuth('CLIENT');
    if (!user || !user.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    const body = await request.json();

    // Verify session belongs to user
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.clientId !== user.id) {
      // WorkoutSession.clientId references User.id, not Client.id
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update set logs - new format: { exerciseLogs: [{ workoutExerciseId, setLogs: [...] }] }
    if (body.exerciseLogs && Array.isArray(body.exerciseLogs)) {
      for (const exerciseLog of body.exerciseLogs) {
        const { workoutExerciseId, setLogs } = exerciseLog;

        if (!workoutExerciseId || !setLogs || !Array.isArray(setLogs)) {
          continue;
        }

        // Get workout exercise to get target values
        const workoutExercise = await prisma.workoutExercise.findUnique({
          where: { id: workoutExerciseId },
        });

        if (!workoutExercise) {
          continue;
        }

        // Get target reps/weights
        const targetReps = Array.isArray(workoutExercise.targetRepsBySet)
          ? workoutExercise.targetRepsBySet
          : typeof workoutExercise.targetRepsBySet === 'number'
          ? [workoutExercise.targetRepsBySet]
          : [8];

        const targetWeights = Array.isArray(workoutExercise.targetWeightBySet)
          ? workoutExercise.targetWeightBySet
          : workoutExercise.targetWeightBySet
          ? [workoutExercise.targetWeightBySet]
          : [];

        // Process each set log
        for (const setLog of setLogs) {
          const { setIndex, actualReps, actualWeight, isExtraSet } = setLog;

          // Determine if this is an extra set
          const isExtra = isExtraSet || setIndex > targetReps.length;

          // Get or create the set log
          const existingLog = await prisma.exerciseSetLog.findUnique({
            where: {
              sessionId_workoutExerciseId_setNumber: {
                sessionId,
                workoutExerciseId,
                setNumber: setIndex,
              },
            },
          });

          const targetRep = targetReps[setIndex - 1] as number || 8;
          const targetWeight = targetWeights[setIndex - 1] as number || null;

          if (existingLog) {
            // Update existing log
            await prisma.exerciseSetLog.update({
              where: { id: existingLog.id },
              data: {
                actualReps: actualReps !== undefined ? actualReps : null,
                actualWeight: actualWeight !== undefined ? actualWeight : null,
                actualUnit: 'kg',
              },
            });
          } else {
            // Create new log
            await prisma.exerciseSetLog.create({
              data: {
                sessionId,
                workoutExerciseId,
                exerciseName: workoutExercise.name,
                setNumber: setIndex,
                targetReps: targetRep,
                targetWeight,
                targetUnit: 'kg',
                actualReps: actualReps !== undefined ? actualReps : null,
                actualWeight: actualWeight !== undefined ? actualWeight : null,
                actualUnit: 'kg',
              },
            });
          }
        }
      }
    }

    // Update session status if provided
    if (body.status) {
      await prisma.workoutSession.update({
        where: { id: sessionId },
        data: {
          status: body.status,
          dateTimeCompleted: body.status === 'COMPLETED' ? new Date() : undefined,
          clientNotes: body.clientNotes || undefined,
        },
      });
    }

    // Return updated session with logs
    const updatedSession = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
      include: {
        setLogs: {
          include: {
            workoutExercise: true,
          },
          orderBy: [
            { workoutExercise: { block: { section: { order: 'asc' } } } },
            { workoutExercise: { block: { order: 'asc' } } },
            { workoutExercise: { order: 'asc' } },
            { setNumber: 'asc' },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error: any) {
    console.error('Error updating exercise logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update exercise logs' },
      { status: 500 }
    );
  }
}

