import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { Trophy, TrendingUp, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLeaderboardsPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  // Get top users by XP
  const topUsersByXP = await prisma.gamificationProfile.findMany({
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

  // Get top users by streak
  const topUsersByStreak = await prisma.gamificationProfile.findMany({
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

  // Get top users by workouts completed
  const topUsersByWorkouts = await prisma.gamificationProfile.findMany({
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Leaderboards' : 'Clasificaciones'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'View top performers across the platform'
              : 'Ver a los mejores del rendimiento en la plataforma'}
          </p>
        </header>

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
                {topUsersByXP.map((profile: any, index: number) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-slate-500/20 text-slate-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {profile.client.user?.name || profile.client.user?.email || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-400">Level {profile.level}</p>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-400">{profile.xp.toLocaleString()} XP</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                {lang === 'en' ? 'Top Streaks' : 'Mejores Racha'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topUsersByStreak.map((profile: any, index: number) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-slate-500/20 text-slate-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {profile.client.user?.name || profile.client.user?.email || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-400">Best: {profile.bestStreak} days</p>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-400">🔥 {profile.streakDays} days</p>
                  </div>
                ))}
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
                {topUsersByWorkouts.map((profile: any, index: number) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-slate-500/20 text-slate-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {profile.client.user?.name || profile.client.user?.email || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-400">{profile.totalHabits} habits</p>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-400">{profile.totalWorkouts} workouts</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

