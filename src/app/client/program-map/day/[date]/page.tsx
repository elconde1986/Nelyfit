import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { DayDetailsClient } from './day-details-client';
import { prisma } from '@/lib/prisma';

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export const dynamic = 'force-dynamic';

export default async function DayDetailsPage({
  params,
}: {
  params: { date: string };
}) {
  const user = await requireAuth('CLIENT');
  if (!user || !user.clientId) redirect('/login/client');

  const lang = getLang();

  // Fetch day details directly from database
  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    include: {
      currentProgram: {
        include: {
          days: {
            orderBy: { dayIndex: 'asc' },
            include: {
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
            },
          },
        },
      },
    },
  });

  if (!client || !client.currentProgram || !client.programStartDate) {
    redirect('/client/program-map');
  }

  const targetDate = new Date(params.date);
  const programStart = startOfDay(client.programStartDate);
  const diffDays = Math.floor(
    (targetDate.getTime() - programStart.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const programDay = client.currentProgram.days.find((d) => d.dayIndex === diffDays);
  
  if (!programDay) {
    redirect('/client/program-map');
  }

  // Get session for this day
  const session = await prisma.workoutSession.findFirst({
    where: {
      clientId: client.id,
      programDayId: programDay.id,
      dateTimeStarted: {
        gte: startOfDay(targetDate),
        lt: new Date(startOfDay(targetDate).getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      setLogs: {
        include: {
          workoutExercise: true,
        },
        orderBy: [
          { workoutExercise: { block: { section: { order: 'asc' } } } },
          { workoutExercise: { block: { order: 'asc' } } },
          { workoutExercise: { order: 'asc' } },
          { setNumber: 'asc' },
        ],
      },
    },
    orderBy: { dateTimeStarted: 'desc' },
  });

  const today = startOfDay(new Date());
  let status: 'TODAY' | 'COMPLETED' | 'UPCOMING' | 'MISSED' | 'REST' = 'UPCOMING';
  
  if (programDay.isRestDay) {
    status = 'REST';
  } else if (targetDate.getTime() === today.getTime()) {
    status = 'TODAY';
  } else if (targetDate.getTime() < today.getTime()) {
    status = session?.status === 'COMPLETED' ? 'COMPLETED' : 'MISSED';
  }

  const exerciseLogs = session?.setLogs.map((log) => ({
    id: log.id,
    exerciseName: log.exerciseName,
    setNumber: log.setNumber,
    targetReps: log.targetReps,
    targetWeight: log.targetWeight,
    targetUnit: log.targetUnit,
    actualReps: log.actualReps,
    actualWeight: log.actualWeight,
    actualUnit: log.actualUnit,
    feelingCode: log.feelingCode,
    feelingEmoji: log.feelingEmoji,
    feelingNote: log.feelingNote,
  })) || [];

  const dayDetails = {
    date: params.date,
    status,
    workout: programDay.workout
      ? {
          id: programDay.workout.id,
          name: programDay.workout.name,
          description: programDay.workout.description,
          estimatedDuration: programDay.workout.estimatedDuration,
          goal: programDay.workout.goal,
          difficulty: programDay.workout.difficulty,
          tags: programDay.workout.tags,
        }
      : null,
    session: session
      ? {
          id: session.id,
          status: session.status,
          dateTimeStarted: session.dateTimeStarted.toISOString(),
          dateTimeCompleted: session.dateTimeCompleted?.toISOString() || null,
          clientNotes: session.clientNotes,
        }
      : null,
    exerciseLogs,
    programDay: {
      id: programDay.id,
      title: programDay.title,
      isRestDay: programDay.isRestDay,
      notes: programDay.notes,
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <DayDetailsClient dayDetails={dayDetails} lang={lang} />
      </div>
    </main>
  );
}
