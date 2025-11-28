import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await requireAuth('CLIENT');
    if (!user || !user.clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    const body = await request.json();
    const { notesFromClient } = body;

    // Verify session belongs to user
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
      include: {
        setLogs: true,
      },
    });

    if (!session || session.clientId !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Calculate duration
    const totalTimeSeconds = session.dateTimeStarted
      ? Math.floor((new Date().getTime() - session.dateTimeStarted.getTime()) / 1000)
      : 0;

    // Calculate XP (base + bonus per set)
    const baseXP = 50;
    const setsCompleted = session.setLogs.filter(
      (log) => log.actualReps !== null && log.actualWeight !== null
    ).length;
    const bonusXP = setsCompleted * 5;
    const xpEarned = baseXP + bonusXP;

    // Update session
    await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        dateTimeCompleted: new Date(),
        clientNotes: notesFromClient || undefined,
      },
    });

    // Update gamification
    const client = await prisma.client.findUnique({
      where: { id: user.clientId },
      include: { gamification: true },
    });

    let newLevel = 1;
    let leveledUp = false;
    let badgesUnlocked: any[] = [];

    if (client) {
      if (client.gamification) {
        const newXP = client.gamification.xp + xpEarned;
        const oldLevel = client.gamification.level;
        // Simple level calculation: level = floor(xp / 100) + 1
        newLevel = Math.floor(newXP / 100) + 1;
        leveledUp = newLevel > oldLevel;

        await prisma.gamificationProfile.update({
          where: { id: client.gamification.id },
          data: {
            xp: newXP,
            level: newLevel,
            streakDays: { increment: 1 },
            lastActiveDate: new Date(),
            totalWorkouts: { increment: 1 },
            bestStreak: Math.max(
              client.gamification.streakDays + 1,
              client.gamification.bestStreak
            ),
          },
        });
      } else {
        newLevel = Math.floor(xpEarned / 100) + 1;
        await prisma.gamificationProfile.create({
          data: {
            clientId: client.id,
            xp: xpEarned,
            level: newLevel,
            streakDays: 1,
            lastActiveDate: new Date(),
            totalWorkouts: 1,
            bestStreak: 1,
          },
        });
      }

      // Simple badge check (placeholder - real implementation would be more sophisticated)
      if (setsCompleted >= 20) {
        badgesUnlocked.push({
          id: 'high-volume',
          name: 'High Volume',
          description: 'Completed 20+ sets in a single workout',
        });
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: 'COMPLETED',
        totalTimeSeconds,
        xpEarned,
      },
      gamification: {
        xp: (client?.gamification?.xp || 0) + xpEarned,
        level: newLevel,
        leveledUp,
        badgesUnlocked,
      },
    });
  } catch (error: any) {
    console.error('Error completing session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete session' },
      { status: 500 }
    );
  }
}

