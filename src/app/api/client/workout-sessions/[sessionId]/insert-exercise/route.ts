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
    const { exerciseId, insertAfterWorkoutExerciseId } = body;

    if (!exerciseId) {
      return NextResponse.json({ error: 'exerciseId required' }, { status: 400 });
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
                      orderBy: { order: 'asc' },
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

    // Get exercise from library
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    // Find the block to insert into (default to last block of MAIN section)
    let targetBlock: any = null;
    let insertOrder = 1;

    if (insertAfterWorkoutExerciseId) {
      // Find the exercise and insert after it
      for (const section of session.workout.sections) {
        for (const block of section.blocks) {
          const exerciseIndex = block.exercises.findIndex(
            (e: any) => e.id === insertAfterWorkoutExerciseId
          );
          if (exerciseIndex >= 0) {
            targetBlock = block;
            insertOrder = block.exercises[exerciseIndex].order + 1;
            // Update orders of subsequent exercises
            for (let i = exerciseIndex + 1; i < block.exercises.length; i++) {
              await prisma.workoutExercise.update({
                where: { id: block.exercises[i].id },
                data: { order: block.exercises[i].order + 1 },
              });
            }
            break;
          }
        }
        if (targetBlock) break;
      }
    }

    // If no target found, use last block of MAIN section
    if (!targetBlock) {
      const mainSection = session.workout.sections.find((s: any) => 
        s.name.toUpperCase().includes('MAIN')
      ) || session.workout.sections[session.workout.sections.length - 1];

      if (mainSection && mainSection.blocks.length > 0) {
        targetBlock = mainSection.blocks[mainSection.blocks.length - 1];
        const maxOrder = Math.max(
          ...targetBlock.exercises.map((e: any) => e.order),
          0
        );
        insertOrder = maxOrder + 1;
      }
    }

    if (!targetBlock) {
      return NextResponse.json({ error: 'Could not determine insertion point' }, { status: 400 });
    }

    // Create temporary workout exercise (session-only, marked by isAdHoc if we add that field)
    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        blockId: targetBlock.id,
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        equipment: exercise.equipment,
        musclesTargeted: exercise.musclesTargeted,
        notes: exercise.notes,
        targetRepsBySet: exercise.reps ? [exercise.reps] : [8] as any,
        targetWeightBySet: exercise.weight ? [exercise.weight] as any : null,
        targetRestBySet: exercise.restSeconds ? [exercise.restSeconds] as any : [60] as any,
        order: insertOrder,
      },
    });

    return NextResponse.json({
      success: true,
      workoutExercise: {
        id: workoutExercise.id,
        name: workoutExercise.name,
        exerciseId: workoutExercise.exerciseId,
      },
    });
  } catch (error: any) {
    console.error('Error inserting exercise:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to insert exercise' },
      { status: 500 }
    );
  }
}

