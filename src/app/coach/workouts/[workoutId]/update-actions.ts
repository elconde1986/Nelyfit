'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function updateWorkoutStructure(workoutId: string, data: {
  sections: Array<{
    id?: string;
    name: string;
    order: number;
    notes?: string;
    blocks: Array<{
      id?: string;
      type: string;
      title?: string;
      instructions?: string;
      rounds?: number;
      restBetweenRounds?: number;
      estimatedTime?: number;
      order: number;
      exercises: Array<{
        id?: string;
        name: string;
        category?: string;
        equipment?: string;
        notes?: string;
        coachNotes?: string;
        targetRepsBySet: number[];
        targetWeightBySet?: (number | null)[];
        targetRestBySet?: number[];
        order: number;
      }>;
    }>;
  }>;
}) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        sections: {
          include: {
            blocks: {
              include: {
                exercises: true,
              },
            },
          },
        },
      },
    });

    if (!workout) {
      return { success: false, error: 'Workout not found' };
    }

    // Check permissions
    if (workout.coachId !== user.id && user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete existing sections (cascade will delete blocks and exercises)
    await prisma.workoutSection.deleteMany({
      where: { workoutId },
    });

    // Create new sections with blocks and exercises
    await prisma.workout.update({
      where: { id: workoutId },
      data: {
        sections: {
          create: data.sections.map((section) => ({
            name: section.name,
            order: section.order,
            notes: section.notes,
            blocks: {
              create: section.blocks.map((block) => ({
                type: block.type as any,
                title: block.title,
                instructions: block.instructions,
                rounds: block.rounds,
                restBetweenRounds: block.restBetweenRounds,
                estimatedTime: block.estimatedTime,
                order: block.order,
                exercises: {
                  create: block.exercises.map((exercise) => ({
                    name: exercise.name,
                    category: exercise.category,
                    equipment: exercise.equipment,
                    musclesTargeted: exercise.category ? [exercise.category] : [],
                    notes: exercise.notes,
                    coachNotes: exercise.coachNotes,
                    targetRepsBySet: exercise.targetRepsBySet as any,
                    targetWeightBySet: (exercise.targetWeightBySet || []) as any,
                    targetRestBySet: (exercise.targetRestBySet || []) as any,
                    order: exercise.order,
                  })),
                },
              })),
            },
          })),
        },
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating workout structure:', error);
    return { success: false, error: error.message || 'Failed to update workout structure' };
  }
}

