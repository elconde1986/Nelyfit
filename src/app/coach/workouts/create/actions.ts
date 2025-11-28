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
    // Validate required data
    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Workout name is required' };
    }

    if (!data.sections || data.sections.length === 0) {
      return { success: false, error: 'At least one section is required' };
    }

    // Validate sections have blocks and exercises
    for (const section of data.sections) {
      if (!section.blocks || section.blocks.length === 0) {
        return { success: false, error: `Section "${section.name}" must have at least one block` };
      }
      for (const block of section.blocks) {
        if (!block.exercises || block.exercises.length === 0) {
          return { success: false, error: `Block "${block.title || 'Untitled'}" must have at least one exercise` };
        }
        for (const exercise of block.exercises) {
          if (!exercise.name || !exercise.name.trim()) {
            return { success: false, error: 'All exercises must have a name' };
          }
          if (!exercise.targetRepsBySet || exercise.targetRepsBySet.length === 0) {
            return { success: false, error: `Exercise "${exercise.name}" must have at least one set` };
          }
        }
      }
    }

    console.log('Creating workout:', {
      name: data.name,
      sectionsCount: data.sections.length,
      totalExercises: data.sections.reduce((sum, s) => 
        sum + s.blocks.reduce((blockSum, b) => blockSum + b.exercises.length, 0), 0
      ),
    });

    const workout = await prisma.workout.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        coachId: user.id,
        goal: data.goal as any,
        difficulty: data.difficulty as any,
        trainingEnvironment: data.trainingEnvironment as any,
        primaryBodyFocus: data.primaryBodyFocus || null,
        estimatedDuration: data.estimatedDuration || 30,
        sessionTypes: (data.sessionTypes || []) as any[],
        tags: data.tags || [],
        visibility: data.visibility || 'PRIVATE',
        sections: {
          create: data.sections.map((section) => ({
            name: section.name.trim() || 'Section',
            order: section.order,
            notes: section.notes?.trim() || null,
            blocks: {
              create: section.blocks.map((block) => ({
                type: block.type as any,
                title: block.title?.trim() || null,
                instructions: block.instructions?.trim() || null,
                rounds: block.rounds || null,
                restBetweenRounds: block.restBetweenRounds || null,
                estimatedTime: block.estimatedTime || null,
                order: block.order,
                exercises: {
                  create: block.exercises.map((exercise) => ({
                    name: exercise.name.trim(),
                    category: exercise.category?.trim() || null,
                    equipment: exercise.equipment?.trim() || null,
                    notes: exercise.notes?.trim() || null,
                    coachNotes: exercise.coachNotes?.trim() || null,
                    targetRepsBySet: exercise.targetRepsBySet as any,
                    targetWeightBySet: (exercise.targetWeightBySet && exercise.targetWeightBySet.length > 0) 
                      ? (exercise.targetWeightBySet as any) 
                      : null,
                    targetRestBySet: (exercise.targetRestBySet && exercise.targetRestBySet.length > 0)
                      ? (exercise.targetRestBySet as any)
                      : null,
                    order: exercise.order,
                    musclesTargeted: [], // Empty array for now
                  })),
                },
              })),
            },
          })),
        },
      },
    });

    console.log('Workout created successfully:', workout.id);
    return { success: true, workoutId: workout.id };
  } catch (error: any) {
    console.error('Error creating workout:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return { 
      success: false, 
      error: error.message || 'Failed to create workout. Please check the console for details.' 
    };
  }
}

