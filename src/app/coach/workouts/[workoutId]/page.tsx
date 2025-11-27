import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import WorkoutDetailClient from './workout-detail-client';

export const dynamic = 'force-dynamic';

export default async function WorkoutDetailPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();

  const workout = await prisma.workout.findUnique({
    where: { id: params.workoutId },
    include: {
      coach: {
        select: { id: true, name: true, email: true },
      },
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
      sessions: {
        select: {
          id: true,
          status: true,
          dateTimeCompleted: true,
        },
      },
      programDays: {
        select: { id: true },
      },
      _count: {
        select: {
          sessions: true,
          programDays: true,
        },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  // Check permissions
  const isOwner = workout.coachId === user.id;
  const isAdmin = user.role === 'ADMIN';
  const canEdit = isOwner || isAdmin;
  const isGlobal = workout.visibility === 'PUBLIC' && !workout.coachId;

  // Calculate analytics
  const completedSessions = workout.sessions.filter(s => s.status === 'COMPLETED').length;
  const totalSessions = workout.sessions.length;
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const timesUsed = workout._count.programDays;
  const timesCompleted = completedSessions;

  return (
    <WorkoutDetailClient
      workout={workout}
      coachId={user.id}
      canEdit={canEdit}
      isOwner={isOwner}
      isAdmin={isAdmin}
      isGlobal={isGlobal}
      lang={lang}
      analytics={{
        timesUsed,
        timesCompleted,
        completionRate,
        totalSessions,
      }}
    />
  );
}

