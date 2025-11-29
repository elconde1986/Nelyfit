import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await requireAuth('CLIENT');
    if (!user || !user.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;

    // Fetch session with full workout details
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
      include: {
        workout: {
          include: {
            sections: {
              include: {
                blocks: {
                  include: {
                    exercises: {
                      orderBy: { order: 'asc' },
                      include: {
                        exercise: {
                          include: {
                            coachVideos: {
                              where: {
                                status: 'ACTIVE',
                              },
                              orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
                              take: 1,
                            },
                          },
                        },
                        setLogs: {
                          where: { sessionId },
                          orderBy: { setNumber: 'asc' },
                        },
                      },
                    },
                  },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        programDay: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.workout) {
      return NextResponse.json({ error: 'Workout not found for this session' }, { status: 404 });
    }

    console.log('Session workout sections:', session.workout.sections?.length || 0);
    console.log('Total blocks:', session.workout.sections?.reduce((sum: number, s: any) => sum + (s.blocks?.length || 0), 0) || 0);
    const totalExercises = session.workout.sections?.reduce((sum: number, s: any) => 
      sum + (s.blocks?.reduce((blockSum: number, b: any) => blockSum + (b.exercises?.length || 0), 0) || 0), 0) || 0;
    console.log('Total exercises:', totalExercises);
    
    // Debug: Log section details
    if (session.workout.sections) {
      session.workout.sections.forEach((section: any, sIdx: number) => {
        console.log(`Section ${sIdx}: ${section.name}, blocks: ${section.blocks?.length || 0}`);
        if (section.blocks) {
          section.blocks.forEach((block: any, bIdx: number) => {
            console.log(`  Block ${bIdx}: ${block.title || 'Untitled'}, exercises: ${block.exercises?.length || 0}`);
            if (block.exercises) {
              block.exercises.forEach((ex: any, eIdx: number) => {
                console.log(`    Exercise ${eIdx}: ${ex.name}, targetRepsBySet:`, ex.targetRepsBySet);
              });
            }
          });
        }
      });
    }
    
    if (totalExercises === 0) {
      console.warn('⚠️ WARNING: Workout has no exercises! Client will see empty workout.');
      console.warn('Workout ID:', session.workout.id);
      console.warn('Workout name:', session.workout.name);
    }

    if (session.clientId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get client for coach info
    const client = await prisma.client.findUnique({
      where: { id: user.clientId },
      select: { coachId: true },
    });

    // Calculate total time
    const totalTimeSeconds = session.dateTimeStarted
      ? Math.floor((new Date().getTime() - session.dateTimeStarted.getTime()) / 1000)
      : 0;

    // Build exercises array with previous session data
    const exercises: any[] = [];
    let orderIndex = 1;

    for (const section of session.workout.sections) {
      for (const block of section.blocks) {
        for (const workoutExercise of block.exercises) {
          // Get previous session logs for this exercise
          const previousSession = await prisma.workoutSession.findFirst({
            where: {
              clientId: user.id,
              workoutId: session.workoutId,
              status: 'COMPLETED',
              id: { not: sessionId },
            },
            include: {
              setLogs: {
                where: {
                  workoutExerciseId: workoutExercise.id,
                },
                orderBy: { setNumber: 'asc' },
              },
            },
            orderBy: { dateTimeCompleted: 'desc' },
          });

          const previousSessionSetLogs = previousSession?.setLogs.map((log) => ({
            setIndex: log.setNumber,
            reps: log.actualReps || 0,
            weight: log.actualWeight || 0,
          })) || [];

          // Build prescription string
          const targetReps = Array.isArray(workoutExercise.targetRepsBySet)
            ? (workoutExercise.targetRepsBySet as number[])
            : typeof workoutExercise.targetRepsBySet === 'number'
            ? [workoutExercise.targetRepsBySet]
            : [8];

          const targetWeights = Array.isArray(workoutExercise.targetWeightBySet)
            ? (workoutExercise.targetWeightBySet as number[])
            : workoutExercise.targetWeightBySet && typeof workoutExercise.targetWeightBySet === 'number'
            ? [workoutExercise.targetWeightBySet]
            : [];

          const setsCount = targetReps.length;
          const repRange = targetReps.length > 0
            ? `${Math.min(...targetReps)}–${Math.max(...targetReps)}`
            : (targetReps[0]?.toString() || '8–10');

          let prescription = `${setsCount} sets × ${repRange} reps`;
          if (targetWeights.length > 0 && targetWeights[0]) {
            prescription += ` @ ${targetWeights[0]}kg`;
          }

          // Get current set logs
          const currentSetLogs = workoutExercise.setLogs.map((log) => ({
            setIndex: log.setNumber,
            plannedReps: log.targetReps,
            actualReps: log.actualReps,
            plannedWeight: log.targetWeight,
            actualWeight: log.actualWeight,
            isExtraSet: log.setNumber > targetReps.length,
          }));

          // If no logs exist, create placeholder logs from target reps
          if (currentSetLogs.length === 0) {
            for (let i = 0; i < targetReps.length; i++) {
              currentSetLogs.push({
                setIndex: i + 1,
                plannedReps: targetReps[i] as number,
                actualReps: null,
                plannedWeight: targetWeights[i] as number || null,
                actualWeight: null,
                isExtraSet: false,
              });
            }
          }

          exercises.push({
            workoutExerciseId: workoutExercise.id,
            exerciseId: workoutExercise.exerciseId,
            section: section.name,
            orderIndex: orderIndex++,
            name: workoutExercise.name,
            prescription,
            restSeconds: workoutExercise.targetRestBySet
              ? (Array.isArray(workoutExercise.targetRestBySet)
                  ? workoutExercise.targetRestBySet[0]
                  : workoutExercise.targetRestBySet) as number
              : 60,
            thumbUrl: workoutExercise.exercise?.defaultThumbnailUrl || null,
            logs: {
              setLogs: currentSetLogs,
            },
            previousSessionSetLogs,
          });
        }
      }
    }

    console.log('Total exercises built:', exercises.length);

    // Calculate metrics (placeholder for now)
    const metrics = {
      activeCalories: Math.floor(totalTimeSeconds / 60) * 5, // Rough estimate: 5 cal/min
      heartRate: null as number | null,
      heartRateZone: null as number | null,
    };

    return NextResponse.json({
      session: {
        id: session.id,
        clientId: session.clientId,
        workoutId: session.workoutId,
        scheduledDate: session.programDay
          ? session.programDay.dayIndex.toString()
          : session.dateTimeStarted.toISOString().split('T')[0],
        performedAt: session.dateTimeStarted.toISOString(),
        completionStatus: session.status,
        totalTimeSeconds,
        xpEarned: 0,
      },
      workout: {
        id: session.workout.id,
        name: session.workout.name,
        estimatedDurationMinutes: session.workout.estimatedDuration || 45,
      },
      exercises,
      metrics,
    });
  } catch (error: any) {
    console.error('Error fetching session view:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch session view' },
      { status: 500 }
    );
  }
}

