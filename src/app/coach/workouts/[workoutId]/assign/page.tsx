import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import AssignWorkoutClient from './assign-workout-client';

export const dynamic = 'force-dynamic';

export default async function AssignWorkoutPage({
  params,
  searchParams,
}: {
  params: { workoutId: string };
  searchParams: { clientId?: string };
}) {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();

  const workout = await prisma.workout.findUnique({
    where: { id: params.workoutId },
    select: {
      id: true,
      name: true,
      estimatedDuration: true,
      difficulty: true,
      goal: true,
    },
  });

  if (!workout) {
    notFound();
  }

  // Get coach's clients
  const clients = await prisma.client.findMany({
    where: {
      coachId: user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      currentProgram: {
        select: {
          id: true,
          name: true,
          days: {
            select: { id: true, dayIndex: true, title: true },
            orderBy: { dayIndex: 'asc' },
          },
        },
      },
    },
    orderBy: {
      user: {
        name: 'asc',
      },
    },
  });

  // Get coach's programs
  const programs = await prisma.program.findMany({
    where: {
      coachId: user.id,
    },
    include: {
      days: {
        select: { id: true, dayIndex: true, title: true, workoutId: true },
        orderBy: { dayIndex: 'asc' },
      },
      _count: {
        select: {
          clients: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <AssignWorkoutClient
      workout={workout}
      clients={clients}
      programs={programs}
      coachId={user.id}
      preselectedClientId={searchParams.clientId}
      lang={lang}
    />
  );
}

