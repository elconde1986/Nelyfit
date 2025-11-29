import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
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
    const { workoutExerciseId, newExerciseId } = body;

    if (!workoutExerciseId || !newExerciseId) {
      return NextResponse.json({ error: 'workoutExerciseId and newExerciseId required' }, { status: 400 });
    }

    // Verify session belongs to user
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
      include: {
        workout: {
          include: {
            sections: {
              include: {
                blocks: {
                  include: {
                    exercises: {
                      where: { id: workoutExerciseId },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session || session.clientId !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get the workout exercise to replace
    const workoutExercise = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
    });

    if (!workoutExercise) {
      return NextResponse.json({ error: 'Workout exercise not found' }, { status: 404 });
    }

    // Get the new exercise from library
    const newExercise = await prisma.exercise.findUnique({
      where: { id: newExerciseId },
    });

    if (!newExercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    // Update the workout exercise with new exercise data
    // Preserve the order and block, but update the exercise reference and details
    const updatedWorkoutExercise = await prisma.workoutExercise.update({
      where: { id: workoutExerciseId },
      data: {
        exerciseId: newExercise.id,
        name: newExercise.name,
        category: newExercise.category,
        equipment: newExercise.equipment,
        musclesTargeted: newExercise.musclesTargeted,
        notes: newExercise.notes || workoutExercise.notes,
        // Preserve existing set structure or use defaults from new exercise
        targetRepsBySet: workoutExercise.targetRepsBySet || (newExercise.reps ? [newExercise.reps] : [8]) as any,
        targetWeightBySet: workoutExercise.targetWeightBySet || (newExercise.weight ? [newExercise.weight] : null) as any,
        targetRestBySet: workoutExercise.targetRestBySet || (newExercise.restSeconds ? [newExercise.restSeconds] : [60]) as any,
      },
    });

    return NextResponse.json({
      success: true,
      workoutExercise: {
        id: updatedWorkoutExercise.id,
        name: updatedWorkoutExercise.name,
        exerciseId: updatedWorkoutExercise.exerciseId,
      },
    });
  } catch (error: any) {
    console.error('Error swapping exercise:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to swap exercise' },
      { status: 500 }
    );
  }
}

