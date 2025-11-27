import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminWorkoutsClient from './admin-workouts-client';

export const dynamic = 'force-dynamic';

export default async function AdminWorkoutsPage() {
  const user = await requireAuth('ADMIN');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();

  // Get all workouts with analytics
  const workouts = await prisma.workout.findMany({
    include: {
      coach: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          sessions: true,
          programDays: true,
        },
      },
      sessions: {
        where: {
          status: 'COMPLETED',
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate analytics
  const workoutsWithStats = workouts.map((workout) => {
    const isArchived = workout.tags?.includes('_archived') || false;
    const completedSessions = workout.sessions.length;
    const totalSessions = workout._count.sessions;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    return {
      ...workout,
      isArchived,
      timesUsed: workout._count.programDays,
      timesCompleted: completedSessions,
      completionRate,
      totalSessions,
    };
  });

  // Get categories and tags for management
  const allTags = new Set<string>();
  workouts.forEach((w) => {
    (w.tags || []).forEach((tag: string) => {
      if (tag !== '_archived') {
        allTags.add(tag);
      }
    });
  });

  return (
    <AdminWorkoutsClient
      workouts={workoutsWithStats}
      tags={Array.from(allTags)}
      lang={lang}
    />
  );
}

