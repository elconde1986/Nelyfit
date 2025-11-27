import { prisma } from '@/lib/prisma';
import ClientTodayClient from './today-client';

const DEMO_CLIENT_EMAIL = 'client@nelyfit.demo';

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default async function ClientTodayPage() {
  const client = await prisma.client.findFirst({
    where: { email: DEMO_CLIENT_EMAIL },
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

  // program-based workout of the day (if available)
  let workout = null as any;
  let programDayTitle: string | null = null;
  if (client.currentProgram && client.programStartDate) {
    const start = startOfDay(client.programStartDate);
    const diffDays =
      Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dayIndex = Math.max(1, diffDays);
    const day = client.currentProgram.days.find((d) => d.dayIndex === dayIndex);
    if (day && !day.isRestDay && day.workout) {
      workout = day.workout;
      programDayTitle = day.title;
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
    />
  );
}
