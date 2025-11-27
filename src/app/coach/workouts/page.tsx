import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Dumbbell, FilePlus, Edit, Copy, Archive, Eye, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageToggle } from '@/components/LanguageToggle';
import { logout } from '@/app/logout/actions';
import { translations, Lang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function WorkoutsPage() {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();
  const t = translations.coach[lang];

  const coach = await prisma.user.findUnique({
    where: { id: user.id },
    include: { 
      workouts: {
        include: {
          _count: {
            select: { sessions: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
  });

  if (!coach) {
    redirect('/login/coach');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 animate-fade-in">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">{t.workouts}</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              {t.workoutLibrary}
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {lang === 'en' 
                ? 'Create and manage your workout library'
                : 'Crea y gestiona tu biblioteca de entrenamientos'}
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 shrink-0">
            <Button asChild variant="secondary" size="sm">
              <Link href="/coach/dashboard">
                <ArrowLeft className="w-3 h-3 mr-1" />
                {lang === 'en' ? 'Dashboard' : 'Panel'}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/coach/workouts/create">
                <FilePlus className="w-4 h-4 mr-1" />
                {t.newWorkout}
              </Link>
            </Button>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="w-3 h-3 mr-1" />
                {t.logout}
              </Button>
            </form>
          </nav>
        </header>

        <section className="space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold">{t.yourWorkouts}</h2>
          </div>
          <Card className="divide-y divide-slate-800">
            {coach.workouts.length === 0 ? (
              <div className="p-12 text-center">
                <Dumbbell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-slate-400 mb-4">
                  {t.noWorkouts}
                </p>
                <Button asChild>
                  <Link href="/coach/workouts/create">
                    <FilePlus className="w-4 h-4 mr-2" />
                    {t.newWorkout}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {coach.workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-slate-900/40 transition-colors duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-base sm:text-lg">{workout.name}</h3>
                          {workout.visibility === 'PRIVATE' && (
                            <Badge variant="outline" className="text-xs">
                              {t.visibility}: {lang === 'en' ? 'Private' : 'Privado'}
                            </Badge>
                          )}
                          {workout.visibility === 'TEAM' && (
                            <Badge variant="outline" className="text-xs">
                              {t.visibility}: {lang === 'en' ? 'Team' : 'Equipo'}
                            </Badge>
                          )}
                          {workout.visibility === 'PUBLIC' && (
                            <Badge variant="success" className="text-xs">
                              {t.visibility}: {lang === 'en' ? 'Public' : 'Público'}
                            </Badge>
                          )}
                        </div>
                        {workout.description && (
                          <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                            {workout.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                          {workout.goal && (
                            <span className="text-slate-400">
                              {lang === 'en' ? 'Goal' : 'Objetivo'}: <span className="text-slate-300">{workout.goal}</span>
                            </span>
                          )}
                          {workout.difficulty && (
                            <span className="text-slate-400">
                              {lang === 'en' ? 'Difficulty' : 'Dificultad'}: <span className="text-slate-300">{workout.difficulty}</span>
                            </span>
                          )}
                          {workout.estimatedDuration && (
                            <span className="text-slate-400">
                              {workout.estimatedDuration} {lang === 'en' ? 'min' : 'min'}
                            </span>
                          )}
                          {workout.usageCount > 0 && (
                            <span className="text-slate-400">
                              {lang === 'en' ? 'Used' : 'Usado'} {workout.usageCount} {lang === 'en' ? 'times' : 'veces'}
                            </span>
                          )}
                          {workout._count.sessions > 0 && (
                            <span className="text-emerald-400">
                              {workout._count.sessions} {lang === 'en' ? 'sessions' : 'sesiones'}
                            </span>
                          )}
                        </div>
                        {workout.tags && workout.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {workout.tags.slice(0, 5).map((tag, idx) => (
                              <Badge key={idx} variant="default" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Button asChild variant="secondary" size="sm">
                          <Link href={`/coach/workouts/${workout.id}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            {lang === 'en' ? 'View' : 'Ver'}
                          </Link>
                        </Button>
                        <Button asChild variant="secondary" size="sm">
                          <Link href={`/coach/workouts/${workout.id}/edit`}>
                            <Edit className="w-3 h-3 mr-1" />
                            {t.editWorkout}
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-3 h-3 mr-1" />
                          {lang === 'en' ? 'Duplicate' : 'Duplicar'}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Archive className="w-3 h-3 mr-1" />
                          {lang === 'en' ? 'Archive' : 'Archivar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}

