import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import ExerciseVideosClient from './exercise-videos-client';

export const dynamic = 'force-dynamic';

export default async function ExerciseVideosPage({
  params,
}: {
  params: { exerciseId: string };
}) {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();

  const exercise = await prisma.exercise.findUnique({
    where: { id: params.exerciseId },
    select: {
      id: true,
      name: true,
      defaultVideoUrl: true,
      defaultThumbnailUrl: true,
    },
  });

  if (!exercise) {
    notFound();
  }

  // Get coach's videos for this exercise
  const coachVideos = await prisma.coachExerciseVideo.findMany({
    where: {
      coachId: user.id,
      exerciseId: params.exerciseId,
      status: 'ACTIVE',
    },
    orderBy: [
      { isPrimary: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return (
    <ExerciseVideosClient
      exercise={exercise}
      coachVideos={coachVideos}
      coachId={user.id}
      lang={lang}
    />
  );
}

