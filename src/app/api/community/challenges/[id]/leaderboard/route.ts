import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get challenge leaderboard
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const groupOnly = searchParams.get('groupOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        group: {
          select: { id: true, name: true },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    let where: any = { challengeId: params.id };

    // Filter by group if requested
    if (groupOnly && challenge.groupId) {
      const groupMemberIds = await prisma.groupMember.findMany({
        where: { groupId: challenge.groupId },
        select: { userId: true },
      });

      where.userId = {
        in: groupMemberIds.map(m => m.userId),
      };
    }

    const participants = await prisma.challengeParticipant.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { progress: 'desc' },
        { joinedAt: 'asc' },
      ],
      take: limit,
    });

    // Calculate ranks
    const leaderboard = participants.map((participant, index) => ({
      ...participant,
      rank: index + 1,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

