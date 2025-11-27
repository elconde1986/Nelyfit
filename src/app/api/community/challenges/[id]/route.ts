import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get challenge details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        group: {
          select: { id: true, name: true, isPublic: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { progress: 'desc' },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Check if user has access (public or member of group)
    if (challenge.group && !challenge.group.isPublic) {
      const isMember = await prisma.groupMember.findFirst({
        where: {
          groupId: challenge.group.id,
          userId: user.id,
        },
      });

      if (!isMember && user.role !== 'ADMIN' && user.role !== 'COACH') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Get user's participation
    const userParticipation = challenge.participants.find(p => p.userId === user.id);
    const userRank = userParticipation
      ? challenge.participants.findIndex(p => p.id === userParticipation.id) + 1
      : null;

    return NextResponse.json({
      challenge: {
        ...challenge,
        userParticipation,
        userRank,
      },
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return NextResponse.json({ error: 'Failed to fetch challenge' }, { status: 500 });
  }
}

