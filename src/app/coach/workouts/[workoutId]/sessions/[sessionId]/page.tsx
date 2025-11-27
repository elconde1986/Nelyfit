import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import WorkoutReviewClient from './workout-review-client';

export const dynamic = 'force-dynamic';

export default async function WorkoutReviewPage({
  params,
}: {
  params: { workoutId: string; sessionId: string };
}) {
  const coach = await requireAuth('COACH');
  
  if (!coach) {
    redirect('/login/coach');
  }

  const lang = getLang();

  const session = await prisma.workoutSession.findUnique({
    where: { id: params.sessionId },
    include: {
      client: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
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
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      },
      setLogs: {
        include: {
          workoutExercise: true,
        },
        orderBy: [
          { workoutExercise: { order: 'asc' } },
          { setNumber: 'asc' },
        ],
      },
    },
  });

  if (!session || session.workout.coachId !== coach.id) {
    notFound();
  }

  return (
    <WorkoutReviewClient
      session={session}
      lang={lang}
    />
  );
}

