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
      coach: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      gamification: true,
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
                } 
              } 
            },
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

  // FIRST PRIORITY: Check for directly assigned "Upper Body Focus" workout (even without session)
  const coach = await prisma.user.findFirst({
    where: { email: 'coach@nelsyfit.demo' },
  });
  
  if (coach) {
    // Prioritize workouts with sections (new structure)
    const assignedWorkout = await prisma.workout.findFirst({
      where: {
        name: 'Upper Body Focus',
        coachId: coach.id,
        sections: { some: {} }, // Must have at least one section
      },
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
    });
    
    if (assignedWorkout) {
      // Verify workout has exercises
      const totalExercises = assignedWorkout.sections?.reduce((sum: number, s: any) => 
        sum + (s.blocks?.reduce((blockSum: number, b: any) => blockSum + (b.exercises?.length || 0), 0) || 0), 0) || 0;
      
      if (totalExercises > 0) {
        workout = assignedWorkout;
        programDayTitle = 'Assigned Workout';
        
        // Check if there's already a session for this workout today (prioritize IN_PROGRESS)
        todaySession = await prisma.workoutSession.findFirst({
          where: {
            clientId: user.id,
            workoutId: assignedWorkout.id,
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
          orderBy: [
            { status: 'asc' }, // IN_PROGRESS comes before COMPLETED
            { dateTimeStarted: 'desc' },
          ],
        });
      }
    }
  }

  // SECOND PRIORITY: Check for existing workout sessions (if workout not found above)
  if (!workout) {
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
      orderBy: [
        { status: 'asc' }, // IN_PROGRESS comes before COMPLETED
        { dateTimeStarted: 'desc' },
      ],
    });

    if (todaySession && todaySession.workout) {
      // Verify workout has exercises
      const totalExercises = todaySession.workout.sections?.reduce((sum: number, s: any) => 
        sum + (s.blocks?.reduce((blockSum: number, b: any) => blockSum + (b.exercises?.length || 0), 0) || 0), 0) || 0;
      
      if (totalExercises > 0) {
        workout = todaySession.workout;
        programDayTitle = 'Assigned Workout';
      }
    }
  }
  
  // THIRD PRIORITY: Fall back to program-based workout
  if (!workout) {
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
      hasCoach={!!client.coach}
    />
  );
}
