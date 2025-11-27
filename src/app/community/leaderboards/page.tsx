import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Trophy, TrendingUp, Users, Medal, Award } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LeaderboardsPage() {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  // Get user's groups for group-specific leaderboards
  const userGroups = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: {
      group: {
        select: { id: true, name: true },
      },
    },
  });

  // Global leaderboards
  const topXP = await prisma.gamificationProfile.findMany({
    include: {
      client: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { xp: 'desc' },
    take: 20,
  });

  const topStreaks = await prisma.gamificationProfile.findMany({
    include: {
      client: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { streakDays: 'desc' },
    take: 20,
  });

  const topWorkouts = await prisma.gamificationProfile.findMany({
    include: {
      client: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { totalWorkouts: 'desc' },
    take: 20,
  });

  // Find user's position in each leaderboard
  const userXPProfile = await prisma.gamificationProfile.findUnique({
    where: { clientId: user.id },
    include: {
      client: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  const getUserRank = (list: any[], userId: string) => {
    const index = list.findIndex(p => p.client.user?.id === userId);
    return index >= 0 ? index + 1 : null;
  };

  const userXPRank = getUserRank(topXP, user.id);
  const userStreakRank = getUserRank(topStreaks, user.id);
  const userWorkoutRank = getUserRank(topWorkouts, user.id);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <Award className="w-5 h-5 text-slate-500" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    if (rank === 2) return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    if (rank === 3) return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    return 'bg-slate-800 text-slate-500 border-slate-700';
  };

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
                {lang === 'en' ? 'Leaderboards' : 'Clasificaciones'}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {lang === 'en'
                ? 'See how you rank against others'
                : 'Ve cómo te clasificas contra otros'}
            </p>
          </div>
          <Link href="/community/challenges">
            <Badge variant="secondary" className="cursor-pointer">
              {lang === 'en' ? 'View Challenges' : 'Ver Desafíos'}
            </Badge>
          </Link>
        </header>

        {/* User's Rankings Summary */}
        {userXPProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{lang === 'en' ? 'Your XP Rank' : 'Tu Rango de XP'}</p>
                    <p className="text-2xl font-bold">
                      {userXPRank ? `#${userXPRank}` : 'N/A'}
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {userXPProfile.xp.toLocaleString()} XP • Level {userXPProfile.level}
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{lang === 'en' ? 'Your Streak Rank' : 'Tu Rango de Racha'}</p>
                    <p className="text-2xl font-bold">
                      {userStreakRank ? `#${userStreakRank}` : 'N/A'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  🔥 {userXPProfile.streakDays} {lang === 'en' ? 'days' : 'días'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{lang === 'en' ? 'Your Workout Rank' : 'Tu Rango de Entrenamientos'}</p>
                    <p className="text-2xl font-bold">
                      {userWorkoutRank ? `#${userWorkoutRank}` : 'N/A'}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {userXPProfile.totalWorkouts} {lang === 'en' ? 'workouts' : 'entrenamientos'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Global Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                {lang === 'en' ? 'Top XP' : 'Mejor XP'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topXP.map((profile, index) => {
                  const rank = index + 1;
                  const isUser = profile.client.user?.id === user.id;
                  return (
                    <div
                      key={profile.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                        isUser
                          ? 'bg-emerald-500/10 border-emerald-500/50'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${getRankColor(rank)}`}>
                          {rank <= 3 ? getRankIcon(rank) : rank}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${isUser ? 'text-emerald-400' : ''}`}>
                            {profile.client.user?.name || profile.client.user?.email || 'Unknown'}
                            {isUser && ' (You)'}
                          </p>
                          <p className="text-xs text-slate-400">Level {profile.level}</p>
                        </div>
                      </div>
                      <p className="font-bold text-emerald-400">{profile.xp.toLocaleString()} XP</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                {lang === 'en' ? 'Top Streaks' : 'Mejores Rachas'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topStreaks.map((profile, index) => {
                  const rank = index + 1;
                  const isUser = profile.client.user?.id === user.id;
                  return (
                    <div
                      key={profile.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                        isUser
                          ? 'bg-emerald-500/10 border-emerald-500/50'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${getRankColor(rank)}`}>
                          {rank <= 3 ? getRankIcon(rank) : rank}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${isUser ? 'text-emerald-400' : ''}`}>
                            {profile.client.user?.name || profile.client.user?.email || 'Unknown'}
                            {isUser && ' (You)'}
                          </p>
                          <p className="text-xs text-slate-400">Best: {profile.bestStreak} days</p>
                        </div>
                      </div>
                      <p className="font-bold text-emerald-400">🔥 {profile.streakDays}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                {lang === 'en' ? 'Most Workouts' : 'Más Entrenamientos'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topWorkouts.map((profile, index) => {
                  const rank = index + 1;
                  const isUser = profile.client.user?.id === user.id;
                  return (
                    <div
                      key={profile.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                        isUser
                          ? 'bg-emerald-500/10 border-emerald-500/50'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${getRankColor(rank)}`}>
                          {rank <= 3 ? getRankIcon(rank) : rank}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${isUser ? 'text-emerald-400' : ''}`}>
                            {profile.client.user?.name || profile.client.user?.email || 'Unknown'}
                            {isUser && ' (You)'}
                          </p>
                          <p className="text-xs text-slate-400">{profile.totalHabits} habits</p>
                        </div>
                      </div>
                      <p className="font-bold text-emerald-400">{profile.totalWorkouts}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

