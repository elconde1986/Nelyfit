'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function duplicateWorkout(workoutId: string) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const original = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        sections: {
          include: {
            blocks: {
              include: {
                exercises: {
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!original) {
      return { success: false, error: 'Workout not found' };
    }

    // Create duplicate
    const duplicated = await prisma.workout.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        coachId: user.id,
        goal: original.goal,
        difficulty: original.difficulty,
        trainingEnvironment: original.trainingEnvironment,
        primaryBodyFocus: original.primaryBodyFocus,
        estimatedDuration: original.estimatedDuration,
        sessionTypes: original.sessionTypes as any[],
        tags: original.tags,
        visibility: 'PRIVATE', // Always private for duplicates
        usageCount: 0,
        sections: {
          create: original.sections.map((section) => ({
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
                    musclesTargeted: exercise.musclesTargeted,
                    notes: exercise.notes,
                    coachNotes: exercise.coachNotes,
                    targetRepsBySet: exercise.targetRepsBySet as any,
                    targetWeightBySet: exercise.targetWeightBySet as any,
                    targetRestBySet: exercise.targetRestBySet as any,
                    order: exercise.order,
                  })),
                },
              })),
            },
          })),
        },
      },
    });

    return { success: true, workoutId: duplicated.id };
  } catch (error: any) {
    console.error('Error duplicating workout:', error);
    return { success: false, error: error.message || 'Failed to duplicate workout' };
  }
}

export async function archiveWorkout(workoutId: string, archive: boolean) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      return { success: false, error: 'Workout not found' };
    }

    // Check permissions
    if (workout.coachId !== user.id && user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    // Use tags to mark as archived (can be upgraded to a dedicated field later)
    const currentTags = workout.tags || [];
    const isCurrentlyArchived = currentTags.includes('_archived');
    
    let updatedTags: string[];
    if (archive && !isCurrentlyArchived) {
      updatedTags = [...currentTags, '_archived'];
    } else if (!archive && isCurrentlyArchived) {
      updatedTags = currentTags.filter((t: string) => t !== '_archived');
    } else {
      updatedTags = currentTags;
    }

    await prisma.workout.update({
      where: { id: workoutId },
      data: {
        tags: updatedTags,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error archiving workout:', error);
    return { success: false, error: error.message || 'Failed to archive workout' };
  }
}

export async function updateWorkout(workoutId: string, data: {
  name: string;
  description?: string;
  goal?: string;
  difficulty?: string;
  trainingEnvironment?: string;
  primaryBodyFocus?: string;
  estimatedDuration?: number;
  tags?: string[];
  visibility?: 'PRIVATE' | 'TEAM' | 'PUBLIC';
}) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout) {
      return { success: false, error: 'Workout not found' };
    }

    // Check permissions
    if (workout.coachId !== user.id && user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.workout.update({
      where: { id: workoutId },
      data: {
        name: data.name,
        description: data.description,
        goal: data.goal as any,
        difficulty: data.difficulty as any,
        trainingEnvironment: data.trainingEnvironment as any,
        primaryBodyFocus: data.primaryBodyFocus,
        estimatedDuration: data.estimatedDuration,
        tags: data.tags || [],
        visibility: data.visibility || 'PRIVATE',
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating workout:', error);
    return { success: false, error: error.message || 'Failed to update workout' };
  }
}

