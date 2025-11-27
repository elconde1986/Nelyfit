'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function createProgram(data: {
  name: string;
  description?: string;
  goalTags?: string[];
  difficulty?: string;
  totalWeeks: number;
  targetDaysPerWeek: number;
  visibility: 'PRIVATE' | 'TEAM' | 'PUBLIC';
}) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const program = await prisma.program.create({
      data: {
        name: data.name,
        description: data.description,
        goalTags: data.goalTags || [],
        difficulty: data.difficulty,
        totalWeeks: data.totalWeeks,
        targetDaysPerWeek: data.targetDaysPerWeek,
        visibility: data.visibility,
        coachId: user.id,
        status: 'DRAFT',
        // Create initial weeks
        weeks: {
          create: Array.from({ length: data.totalWeeks }, (_, i) => ({
            weekNumber: i + 1,
            title: `Week ${i + 1}`,
            weekFocus: 'NORMAL',
          })),
        },
      },
    });

    return { success: true, programId: program.id };
  } catch (error: any) {
    console.error('Error creating program:', error);
    return { success: false, error: error.message || 'Failed to create program' };
  }
}

