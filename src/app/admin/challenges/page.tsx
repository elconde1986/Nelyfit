import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Trophy, Calendar, Users, Target } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminChallengesPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const challenges = await prisma.challenge.findMany({
    include: {
      group: {
        select: { id: true, name: true },
      },
      _count: {
        select: { participants: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const stats = {
    total: challenges.length,
    active: challenges.filter(c => new Date() >= c.startDate && new Date() <= c.endDate).length,
    upcoming: challenges.filter(c => new Date() < c.startDate).length,
    completed: challenges.filter(c => new Date() > c.endDate).length,
    totalParticipants: challenges.reduce((sum, c) => sum + c._count.participants, 0),
  };

  const getChallengeStatus = (challenge: any) => {
    const now = new Date();
    if (now < challenge.startDate) {
      return { label: lang === 'en' ? 'Upcoming' : 'Próximo', variant: 'default' as const };
    }
    if (now >= challenge.startDate && now <= challenge.endDate) {
      return { label: lang === 'en' ? 'Active' : 'Activo', variant: 'success' as const };
    }
    return { label: lang === 'en' ? 'Completed' : 'Completado', variant: 'default' as const };
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Challenge Management' : 'Gestión de Desafíos'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'Monitor and manage all platform challenges'
              : 'Monitorea y gestiona todos los desafíos de la plataforma'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total' : 'Total'}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Active' : 'Activos'}</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Upcoming' : 'Próximos'}</p>
              <p className="text-2xl font-bold text-blue-400">{stats.upcoming}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Completed' : 'Completados'}</p>
              <p className="text-2xl font-bold text-slate-400">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Participants' : 'Participantes'}</p>
              <p className="text-2xl font-bold text-purple-400">{stats.totalParticipants}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'All Challenges' : 'Todos los Desafíos'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {challenges.map((challenge) => {
                const status = getChallengeStatus(challenge);
                return (
                  <div
                    key={challenge.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <div className="flex-1">
                        <p className="font-semibold">{challenge.name}</p>
                        {challenge.description && (
                          <p className="text-sm text-slate-400 line-clamp-1">{challenge.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          {challenge.group && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {challenge.group.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                          </span>
                          {challenge.goal && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {challenge.goal}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold">{challenge._count.participants}</p>
                        <p className="text-xs text-slate-400">{lang === 'en' ? 'participants' : 'participantes'}</p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            {challenges.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No challenges found' : 'No se encontraron desafíos'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

