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

    // Update set logs
    if (body.setLogs && Array.isArray(body.setLogs)) {
      for (const logUpdate of body.setLogs) {
        if (logUpdate.id) {
          // Update existing log
          await prisma.exerciseSetLog.update({
            where: { id: logUpdate.id },
            data: {
              actualReps: logUpdate.actualReps ?? undefined,
              actualWeight: logUpdate.actualWeight ?? undefined,
              actualUnit: logUpdate.actualUnit || 'kg',
              feelingCode: logUpdate.feelingCode || undefined,
              feelingEmoji: logUpdate.feelingEmoji || undefined,
              feelingNote: logUpdate.feelingNote || undefined,
            },
          });
        } else if (logUpdate.workoutExerciseId) {
          // Create new log (extra set)
          const maxSetNumber = await prisma.exerciseSetLog.findFirst({
            where: {
              sessionId,
              workoutExerciseId: logUpdate.workoutExerciseId,
            },
            orderBy: { setNumber: 'desc' },
            select: { setNumber: true },
          });

          await prisma.exerciseSetLog.create({
            data: {
              sessionId,
              workoutExerciseId: logUpdate.workoutExerciseId,
              exerciseName: logUpdate.exerciseName || 'Extra Set',
              setNumber: (maxSetNumber?.setNumber || 0) + 1,
              targetReps: logUpdate.targetReps || 0,
              targetWeight: logUpdate.targetWeight || null,
              targetUnit: logUpdate.targetUnit || 'kg',
              actualReps: logUpdate.actualReps || null,
              actualWeight: logUpdate.actualWeight || null,
              actualUnit: logUpdate.actualUnit || 'kg',
              feelingCode: logUpdate.feelingCode || undefined,
              feelingEmoji: logUpdate.feelingEmoji || undefined,
              feelingNote: logUpdate.feelingNote || undefined,
            },
          });
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

