import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challengeId } = await req.json();

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID required' }, { status: 400 });
    }

    // Check if challenge exists and is active/upcoming
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const now = new Date();
    if (challenge.endDate < now) {
      return NextResponse.json({ error: 'Challenge has ended' }, { status: 400 });
    }

    // Check if already joined
    const existing = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already joined this challenge' }, { status: 400 });
    }

    // Join challenge
    await prisma.challengeParticipant.create({
      data: {
        challengeId,
        userId: user.id,
        progress: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining challenge:', error);
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
  }
}

