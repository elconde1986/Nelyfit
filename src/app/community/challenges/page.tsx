import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Trophy, Calendar, Users, Target, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { ChallengeJoinButton } from './challenge-join-button';

export const dynamic = 'force-dynamic';

export default async function ChallengesPage() {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  // Get all active and upcoming challenges
  const now = new Date();
  const challenges = await prisma.challenge.findMany({
    where: {
      OR: [
        { endDate: { gte: now } }, // Active or upcoming
      ],
    },
    include: {
      group: {
        select: { id: true, name: true, isPublic: true },
      },
      participants: {
        where: { userId: user.id },
        take: 1,
      },
      _count: {
        select: { participants: true },
      },
    },
    orderBy: [
      { startDate: 'asc' }, // Upcoming first
    ],
    take: 50,
  });

  // Get user's active challenge participations
  const userParticipations = await prisma.challengeParticipant.findMany({
    where: {
      userId: user.id,
      challenge: {
        endDate: { gte: now },
      },
    },
    include: {
      challenge: {
        include: {
          group: {
            select: { id: true, name: true },
          },
          participants: {
            orderBy: { progress: 'desc' },
            take: 10,
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          _count: {
            select: { participants: true },
          },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  const getChallengeStatus = (challenge: any) => {
    if (now < challenge.startDate) {
      return { label: lang === 'en' ? 'Upcoming' : 'Próximo', variant: 'default' as const, color: 'text-blue-400' };
    }
    if (now >= challenge.startDate && now <= challenge.endDate) {
      return { label: lang === 'en' ? 'Active' : 'Activo', variant: 'success' as const, color: 'text-emerald-400' };
    }
    return { label: lang === 'en' ? 'Ended' : 'Finalizado', variant: 'default' as const, color: 'text-slate-400' };
  };

  const activeChallenges = challenges.filter(c => {
    const status = getChallengeStatus(c);
    return status.label === (lang === 'en' ? 'Active' : 'Activo');
  });

  const upcomingChallenges = challenges.filter(c => {
    const status = getChallengeStatus(c);
    return status.label === (lang === 'en' ? 'Upcoming' : 'Próximo');
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">
                {lang === 'en' ? 'Challenges' : 'Desafíos'}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {lang === 'en'
                ? 'Join challenges, compete with others, and achieve your goals'
                : 'Únete a desafíos, compite con otros y alcanza tus objetivos'}
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/community/leaderboards">
              <Trophy className="w-4 h-4 mr-2" />
              {lang === 'en' ? 'View Leaderboards' : 'Ver Clasificaciones'}
            </Link>
          </Button>
        </header>

        {/* My Active Challenges */}
        {userParticipations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">
              {lang === 'en' ? 'My Active Challenges' : 'Mis Desafíos Activos'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userParticipations.map((participation) => {
                const challenge = participation.challenge;
                const userRank = challenge.participants.findIndex(p => p.userId === user.id) + 1;
                const topParticipant = challenge.participants[0];
                return (
                  <Card key={challenge.id} className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            {challenge.name}
                          </CardTitle>
                          {challenge.description && (
                            <p className="text-sm text-slate-400 mt-1">{challenge.description}</p>
                          )}
                        </div>
                        <Badge variant="success">
                          {lang === 'en' ? 'Joined' : 'Unido'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {challenge.goal && (
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-emerald-400" />
                          <span className="text-slate-300">{challenge.goal}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {challenge._count.participants} {lang === 'en' ? 'participants' : 'participantes'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">{lang === 'en' ? 'Your Progress' : 'Tu Progreso'}</span>
                          <span className="font-bold text-emerald-400">{participation.progress}</span>
                        </div>
                        {topParticipant && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">{lang === 'en' ? 'Leader' : 'Líder'}</span>
                            <span className="font-semibold">
                              {topParticipant.user?.name || topParticipant.user?.email || 'Unknown'}: {topParticipant.progress}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">{lang === 'en' ? 'Your Rank' : 'Tu Posición'}</span>
                          <span className="font-bold text-yellow-400">#{userRank > 0 ? userRank : 'N/A'}</span>
                        </div>
                      </div>
                      <Button asChild variant="secondary" className="w-full">
                        <Link href={`/community/challenges/${challenge.id}`}>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          {lang === 'en' ? 'View Details' : 'Ver Detalles'}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">
              {lang === 'en' ? 'Active Challenges' : 'Desafíos Activos'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.map((challenge) => {
                const isJoined = challenge.participants.length > 0;
                const status = getChallengeStatus(challenge);
                return (
                  <Card key={challenge.id} className="hover:border-emerald-500/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            {challenge.name}
                          </CardTitle>
                          {challenge.description && (
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{challenge.description}</p>
                          )}
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {challenge.goal && (
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-emerald-400" />
                          <span className="text-slate-300">{challenge.goal}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {challenge.group && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.group.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {challenge._count.participants} {lang === 'en' ? 'participants' : 'participantes'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                      </div>
                      {isJoined ? (
                        <Button asChild variant="secondary" className="w-full">
                          <Link href={`/community/challenges/${challenge.id}`}>
                            {lang === 'en' ? 'View Progress' : 'Ver Progreso'}
                          </Link>
                        </Button>
                      ) : (
                        <ChallengeJoinButton challengeId={challenge.id} />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Challenges */}
        {upcomingChallenges.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">
              {lang === 'en' ? 'Upcoming Challenges' : 'Desafíos Próximos'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingChallenges.map((challenge) => {
                const status = getChallengeStatus(challenge);
                return (
                  <Card key={challenge.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-blue-400" />
                            {challenge.name}
                          </CardTitle>
                          {challenge.description && (
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{challenge.description}</p>
                          )}
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {challenge.goal && (
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-300">{challenge.goal}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {challenge.group && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.group.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {lang === 'en' ? 'Starts' : 'Comienza'}: {new Date(challenge.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <ChallengeJoinButton challengeId={challenge.id} disabled={true} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {challenges.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">
                {lang === 'en'
                  ? 'No challenges available at the moment'
                  : 'No hay desafíos disponibles en este momento'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

