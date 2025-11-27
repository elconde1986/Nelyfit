import { requireAuth, getLang } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { prisma } from '@/lib/prisma';
import { ChallengeDetailClient } from './challenge-detail-client';

export const dynamic = 'force-dynamic';

export default async function ChallengeDetailPage({
  params,
}: {
  params: { challengeId: string };
}) {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  // Fetch challenge directly from database
  const challenge = await prisma.challenge.findUnique({
    where: { id: params.challengeId },
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
    notFound();
  }

  // Check access
  if (challenge.group && !challenge.group.isPublic) {
    const isMember = await prisma.groupMember.findFirst({
      where: {
        groupId: challenge.group.id,
        userId: user.id,
      },
    });

    if (!isMember && user.role !== 'ADMIN' && user.role !== 'COACH') {
      redirect('/community/challenges');
    }
  }

  // Get user's participation
  const userParticipation = challenge.participants.find(p => p.userId === user.id);
  const userRank = userParticipation
    ? challenge.participants.findIndex(p => p.id === userParticipation.id) + 1
    : null;

  // Fetch leaderboard
  const leaderboard = challenge.participants.map((p, idx) => ({
    ...p,
    rank: idx + 1,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <ChallengeDetailClient
          challenge={{
            id: challenge.id,
            name: challenge.name,
            description: challenge.description || undefined,
            startDate: challenge.startDate.toISOString(),
            endDate: challenge.endDate.toISOString(),
            goal: challenge.goal || undefined,
            group: challenge.group,
            userParticipation,
            userRank,
            participants: challenge.participants.map(p => ({
              id: p.id,
              userId: p.userId,
              progress: p.progress,
              rank: p.rank,
              user: {
                id: p.user.id,
                name: p.user.name,
                email: p.user.email,
              },
            })),
            _count: challenge._count,
          }}
          leaderboard={leaderboard}
          userId={user.id}
          lang={lang}
        />
      </div>
    </main>
  );
}

