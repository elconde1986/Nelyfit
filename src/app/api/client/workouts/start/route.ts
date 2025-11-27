import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth('CLIENT');
    if (!user || !user.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const dateParam = body.date ? new Date(body.date) : new Date();
    const targetDate = startOfDay(dateParam);

    // Get client with program
    const client = await prisma.client.findUnique({
      where: { id: user.clientId },
      include: {
        currentProgram: {
          include: {
            days: {
              orderBy: { dayIndex: 'asc' },
              include: {
                workout: true,
              },
            },
          },
        },
      },
    });

    if (!client || !client.currentProgram || !client.programStartDate) {
      return NextResponse.json(
        { error: 'No active program assigned' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'No program day found for this date' },
        { status: 404 }
      );
    }

    if (programDay.isRestDay || !programDay.workoutId) {
      return NextResponse.json(
        { error: 'This is a rest day - no workout scheduled' },
        { status: 400 }
      );
    }

    // Check if session already exists for this date
    const existingSession = await prisma.workoutSession.findFirst({
      where: {
        clientId: user.id, // Use user.id, not user.clientId (WorkoutSession.clientId references User.id)
        workoutId: programDay.workoutId,
        programDayId: programDay.id,
        dateTimeStarted: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { dateTimeStarted: 'desc' },
    });

    if (existingSession) {
      // Return existing session (resume mode)
      return NextResponse.json({
        sessionId: existingSession.id,
        status: existingSession.status,
        isResume: true,
      });
    }

    // Get workout exercises to pre-seed set logs
    const workout = await prisma.workout.findUnique({
      where: { id: programDay.workoutId },
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

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Create new workout session
    const session = await prisma.workoutSession.create({
      data: {
        clientId: user.id, // Use user.id, not user.clientId (WorkoutSession.clientId references User.id)
        workoutId: programDay.workoutId,
        programDayId: programDay.id,
        dateTimeStarted: new Date(),
        status: 'IN_PROGRESS',
      },
    });

    // Pre-seed set logs from workout exercises
    const setLogsToCreate: any[] = [];
    let setNumber = 1;

    for (const section of workout.sections) {
      for (const block of section.blocks) {
        for (const exercise of block.exercises) {
          const targetReps = Array.isArray(exercise.targetRepsBySet)
            ? exercise.targetRepsBySet
            : typeof exercise.targetRepsBySet === 'number'
            ? [exercise.targetRepsBySet]
            : [8]; // Default

          const targetWeights = Array.isArray(exercise.targetWeightBySet)
            ? exercise.targetWeightBySet
            : exercise.targetWeightBySet
            ? [exercise.targetWeightBySet]
            : [null];

          for (let i = 0; i < targetReps.length; i++) {
            setLogsToCreate.push({
              sessionId: session.id,
              workoutExerciseId: exercise.id,
              exerciseName: exercise.name,
              setNumber: setNumber++,
              targetReps: targetReps[i] || 8,
              targetWeight: targetWeights[i] || null,
              targetUnit: 'kg',
            });
          }
        }
      }
    }

    if (setLogsToCreate.length > 0) {
      await prisma.exerciseSetLog.createMany({
        data: setLogsToCreate,
      });
    }

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      isResume: false,
    });
  } catch (error: any) {
    console.error('Error starting workout:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start workout' },
      { status: 500 }
    );
  }
}

