'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function createWorkout(data: {
  name: string;
  description?: string;
  goal?: string;
  difficulty?: string;
  trainingEnvironment?: string;
  primaryBodyFocus?: string;
  estimatedDuration?: number;
  sessionTypes?: string[];
  tags?: string[];
  visibility?: 'PRIVATE' | 'TEAM' | 'PUBLIC';
  sections: Array<{
    name: string;
    order: number;
    notes?: string;
    blocks: Array<{
      type: string;
      title?: string;
      instructions?: string;
      rounds?: number;
      restBetweenRounds?: number;
      estimatedTime?: number;
      order: number;
      exercises: Array<{
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
    const workout = await prisma.workout.create({
      data: {
        name: data.name,
        description: data.description,
        coachId: user.id,
        goal: data.goal as any,
        difficulty: data.difficulty as any,
        trainingEnvironment: data.trainingEnvironment as any,
        primaryBodyFocus: data.primaryBodyFocus,
        estimatedDuration: data.estimatedDuration,
        sessionTypes: (data.sessionTypes || []) as any[],
        tags: data.tags || [],
        visibility: data.visibility || 'PRIVATE',
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

    return { success: true, workoutId: workout.id };
  } catch (error: any) {
    console.error('Error creating workout:', error);
    return { success: false, error: error.message || 'Failed to create workout' };
  }
}

