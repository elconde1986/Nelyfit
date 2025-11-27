import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Dumbbell, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminWorkoutHistoryPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const sessions = await prisma.workoutSession.findMany({
    include: {
      client: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      workout: {
        select: { id: true, name: true },
      },
    },
    orderBy: { dateTimeStarted: 'desc' },
    take: 100,
  });

  const stats = {
    total: await prisma.workoutSession.count(),
    completed: sessions.filter(s => s.status === 'COMPLETED').length,
    inProgress: sessions.filter(s => s.status === 'IN_PROGRESS').length,
    uniqueUsers: new Set(sessions.map(s => s.clientId)).size,
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
              {lang === 'en' ? 'Workout History' : 'Historial de Entrenamientos'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'View all workout sessions across the platform'
              : 'Ver todas las sesiones de entrenamiento en la plataforma'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Sessions' : 'Sesiones Totales'}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Completed' : 'Completadas'}</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'In Progress' : 'En Progreso'}</p>
              <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Active Users' : 'Usuarios Activos'}</p>
              <p className="text-2xl font-bold text-purple-400">{stats.uniqueUsers}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Recent Sessions' : 'Sesiones Recientes'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Dumbbell className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-semibold">{session.workout?.name || 'Unknown Workout'}</p>
                      <p className="text-sm text-slate-400">
                        {session.client.user?.name || session.client.user?.email || 'Unknown User'}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.dateTimeStarted).toLocaleDateString()}
                        {session.dateTimeCompleted && (
                          <>
                            {' • '}
                            {Math.round((new Date(session.dateTimeCompleted).getTime() - new Date(session.dateTimeStarted).getTime()) / 60000)} min
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      session.status === 'COMPLETED'
                        ? 'success'
                        : session.status === 'IN_PROGRESS'
                        ? 'default'
                        : 'default'
                    }
                  >
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
            {sessions.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No workout sessions found' : 'No se encontraron sesiones de entrenamiento'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

