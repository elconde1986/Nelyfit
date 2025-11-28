import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClientTodayClient from './today-client';

export const dynamic = 'force-dynamic';

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default async function ClientTodayPage() {
  const user = await requireAuth('CLIENT');
  
  if (!user || !user.clientId) {
    redirect('/login/client');
  }

  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    include: {
      gamification: true,
      currentProgram: {
        include: {
          days: {
            orderBy: { dayIndex: 'asc' },
            include: { workout: { include: { exercises: true } } },
          },
        },
      },
      logs: true,
      notifications: {
        where: { readAt: null },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  });

  if (!client) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-300">
          Demo client not found. Run <code>npx prisma migrate dev</code> and{' '}
          <code>npx prisma db seed</code>.
        </p>
      </main>
    );
  }

  const today = startOfDay(new Date());
  const log = await prisma.completionLog.findFirst({
    where: {
      clientId: client.id,
      date: {
        gte: today,
        lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      },
    },
  });

  // simple default habits
  const habits = [
    { id: 'water', labelEn: 'Drink 2L of water', labelEs: 'Toma 2L de agua' },
    { id: 'steps', labelEn: 'Walk 7k+ steps', labelEs: 'Camina 7k+ pasos' },
    { id: 'sleep', labelEn: 'Sleep 7+ hours', labelEs: 'Duerme 7+ horas' },
  ];

  // Check for directly assigned workout session for today (highest priority)
  let todaySession: any = null;
  let workout = null as any;
  let programDayTitle: string | null = null;
  let programDay = null as any;

  // First, check for directly assigned workouts (scheduled sessions)
  todaySession = await prisma.workoutSession.findFirst({
    where: {
      clientId: user.id, // WorkoutSession.clientId references User.id
      dateTimeStarted: {
        gte: today,
        lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      },
      OR: [
        { status: 'IN_PROGRESS' },
        { status: 'COMPLETED' },
      ],
    },
    include: {
      workout: {
        include: {
          sections: {
            include: {
              blocks: {
                include: {
                  exercises: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { dateTimeStarted: 'desc' },
  });

  if (todaySession && todaySession.workout) {
    workout = todaySession.workout;
    programDayTitle = 'Assigned Workout';
  } else {
    // Fall back to program-based workout of the day (if available)
    if (client.currentProgram && client.programStartDate) {
      const start = startOfDay(client.programStartDate);
      const diffDays =
        Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const dayIndex = Math.max(1, diffDays);
      const day = client.currentProgram.days.find((d) => d.dayIndex === dayIndex);
      if (day && !day.isRestDay && day.workout) {
        workout = day.workout;
        programDayTitle = day.title;
        programDay = day;

        // Check for existing workout session for program day
        todaySession = await prisma.workoutSession.findFirst({
          where: {
            clientId: user.id,
            programDayId: programDay.id,
            dateTimeStarted: {
              gte: today,
              lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
            },
          },
          orderBy: { dateTimeStarted: 'desc' },
        });
      }
    }
  }

  const gamificationSnapshot = client.gamification
    ? {
        xp: client.gamification.xp,
        level: client.gamification.level,
        streakDays: client.gamification.streakDays,
        bestStreak: client.gamification.bestStreak,
      }
    : { xp: 0, level: 1, streakDays: 0, bestStreak: 0 };

  return (
    <ClientTodayClient
      clientName={client.name}
      workout={workout}
      habits={habits}
      log={log as any}
      initialGamification={gamificationSnapshot}
      initialLang={client.preferredLang as 'en' | 'es'}
      notifications={client.notifications}
      programDayTitle={programDayTitle}
      todaySession={todaySession}
    />
  );
}
