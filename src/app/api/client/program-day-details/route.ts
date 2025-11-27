import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth('CLIENT');
    if (!user || !user.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    if (!dateParam) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
    }

    const targetDate = startOfDay(new Date(dateParam));
    const today = startOfDay(new Date());

    // Get client with program
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
      return NextResponse.json({
        date: dateParam,
        status: 'NO_PROGRAM',
        workout: null,
        session: null,
        exerciseLogs: [],
      });
    }

    // Calculate which program day this date corresponds to
    const programStart = startOfDay(client.programStartDate);
    const diffDays = Math.floor(
      (targetDate.getTime() - programStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const programDay = client.currentProgram.days.find(
      (d) => d.dayIndex === diffDays
    );

    if (!programDay) {
      return NextResponse.json({
        date: dateParam,
        status: 'NO_DAY',
        workout: null,
        session: null,
        exerciseLogs: [],
      });
    }

    // Determine status
    let status: 'TODAY' | 'COMPLETED' | 'UPCOMING' | 'MISSED' | 'REST' = 'UPCOMING';
    
    if (programDay.isRestDay) {
      status = 'REST';
    } else if (targetDate.getTime() === today.getTime()) {
      status = 'TODAY';
    } else if (targetDate.getTime() < today.getTime()) {
      // Check if completed
      const session = await prisma.workoutSession.findFirst({
        where: {
          clientId: user.clientId,
          programDayId: programDay.id,
          status: 'COMPLETED',
          dateTimeStarted: {
            gte: targetDate,
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
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
      });
      
      if (session) {
        status = 'COMPLETED';
      } else {
        status = 'MISSED';
      }
    }

    // Get workout session for this day
    const session = await prisma.workoutSession.findFirst({
      where: {
        clientId: user.clientId,
        programDayId: programDay.id,
        dateTimeStarted: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        setLogs: {
          include: {
            workoutExercise: {
              include: {
                exercise: true,
              },
            },
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

    // Format exercise logs
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

    return NextResponse.json({
      date: dateParam,
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
    });
  } catch (error: any) {
    console.error('Error fetching program day details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch program day details' },
      { status: 500 }
    );
  }
}

