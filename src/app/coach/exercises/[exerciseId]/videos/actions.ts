'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function createCoachVideo(data: {
  exerciseId: string;
  videoUrl: string;
  title: string;
  description?: string;
  language: string;
  variantType: string;
  isPrimary: boolean;
}) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // If setting as primary, unset other primary videos for this exercise
    if (data.isPrimary) {
      await prisma.coachExerciseVideo.updateMany({
        where: {
          coachId: user.id,
          exerciseId: data.exerciseId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    const video = await prisma.coachExerciseVideo.create({
      data: {
        coachId: user.id,
        exerciseId: data.exerciseId,
        videoUrl: data.videoUrl,
        title: data.title,
        description: data.description,
        language: data.language,
        variantType: data.variantType,
        isPrimary: data.isPrimary,
        storageType: 'YOUTUBE',
        status: 'ACTIVE',
      },
    });

    return { success: true, videoId: video.id };
  } catch (error: any) {
    console.error('Error creating coach video:', error);
    return { success: false, error: error.message || 'Failed to create video' };
  }
}

export async function updateCoachVideo(
  videoId: string,
  data: {
    title?: string;
    description?: string;
    language?: string;
    variantType?: string;
  }
) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const video = await prisma.coachExerciseVideo.findUnique({
      where: { id: videoId },
    });

    if (!video || video.coachId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.coachExerciseVideo.update({
      where: { id: videoId },
      data,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating coach video:', error);
    return { success: false, error: error.message || 'Failed to update video' };
  }
}

export async function archiveCoachVideo(videoId: string) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const video = await prisma.coachExerciseVideo.findUnique({
      where: { id: videoId },
    });

    if (!video || video.coachId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.coachExerciseVideo.update({
      where: { id: videoId },
      data: {
        status: 'ARCHIVED',
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error archiving coach video:', error);
    return { success: false, error: error.message || 'Failed to archive video' };
  }
}

export async function setPrimaryVideo(videoId: string) {
  const user = await requireAuth('COACH');
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const video = await prisma.coachExerciseVideo.findUnique({
      where: { id: videoId },
      include: { exercise: true },
    });

    if (!video || video.coachId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Unset other primary videos for this exercise
    await prisma.coachExerciseVideo.updateMany({
      where: {
        coachId: user.id,
        exerciseId: video.exerciseId,
        isPrimary: true,
        id: { not: videoId },
      },
      data: {
        isPrimary: false,
      },
    });

    // Set this one as primary
    await prisma.coachExerciseVideo.update({
      where: { id: videoId },
      data: {
        isPrimary: true,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error setting primary video:', error);
    return { success: false, error: error.message || 'Failed to set primary video' };
  }
}

