import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import ProgramPlannerClient from './program-planner-client';

export const dynamic = 'force-dynamic';

export default async function ProgramPlannerPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();

  const program = await prisma.program.findUnique({
    where: { id: params.id },
    include: {
      weeks: {
        include: {
          days: {
            include: {
              workout: {
                select: {
                  id: true,
                  name: true,
                  estimatedDuration: true,
                  difficulty: true,
                  goal: true,
                  tags: true,
                },
              },
            },
            orderBy: { dayIndex: 'asc' },
          },
        },
        orderBy: { weekNumber: 'asc' },
      },
      coach: {
        select: { id: true, name: true },
      },
    },
  });

  if (!program) {
    notFound();
  }

  if (program.coachId !== user.id && user.role !== 'ADMIN') {
    redirect('/coach/programs');
  }

  // Get coach's workouts for the library panel
  const allWorkouts = await prisma.workout.findMany({
    where: {
      OR: [
        { coachId: user.id },
        { visibility: 'TEAM' },
        { visibility: 'PUBLIC' },
      ],
    },
    select: {
      id: true,
      name: true,
      estimatedDuration: true,
      difficulty: true,
      goal: true,
      tags: true,
      trainingEnvironment: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  // Filter out archived workouts
  const workouts = allWorkouts.filter((w) => !(w.tags || []).includes('_archived'));

  return (
    <ProgramPlannerClient
      program={program}
      workouts={workouts}
      coachId={user.id}
      lang={lang}
    />
  );
}

