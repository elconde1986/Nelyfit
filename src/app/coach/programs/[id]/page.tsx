import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageToggle } from '@/components/LanguageToggle';
import { translations, Lang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function ProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();
  const t = translations.coach[lang] || translations.coach.en;

  const program = await prisma.program.findUnique({
    where: { id: params.id },
    include: {
      weeks: {
        include: {
          days: {
            include: {
              workout: {
                select: {
                  id: true,
                  name: true,
                  estimatedDuration: true,
                },
              },
            },
            orderBy: { dayIndex: 'asc' },
          },
        },
        orderBy: { weekNumber: 'asc' },
      },
      _count: {
        select: {
          clients: true,
          days: true,
        },
      },
    },
  });

  if (!program) {
    notFound();
  }

  if (program.coachId !== user.id && user.role !== 'ADMIN') {
    redirect('/coach/programs');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/coach/programs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">{program.name}</span>
              </h1>
              <p className="text-slate-400 mt-1">
                {program.description || (lang === 'en' ? 'Program Details' : 'Detalles del Programa')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href={`/coach/programs/${program.id}/planner`}>
                <Calendar className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Open Planner' : 'Abrir Planificador'}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{lang === 'en' ? 'Program Overview' : 'Resumen del Programa'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Weeks' : 'Semanas Totales'}</p>
                    <p className="text-2xl font-bold">{program.totalWeeks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{lang === 'en' ? 'Days per Week' : 'Días por Semana'}</p>
                    <p className="text-2xl font-bold">{program.targetDaysPerWeek}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{lang === 'en' ? 'Assigned Clients' : 'Clientes Asignados'}</p>
                    <p className="text-2xl font-bold">{program._count.clients}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Days' : 'Días Totales'}</p>
                    <p className="text-2xl font-bold">{program._count.days}</p>
                  </div>
                </div>
                {program.goalTags && program.goalTags.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">{lang === 'en' ? 'Goal Tags' : 'Etiquetas de Objetivo'}</p>
                    <div className="flex flex-wrap gap-2">
                      {program.goalTags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {program.difficulty && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">{lang === 'en' ? 'Difficulty' : 'Dificultad'}</p>
                    <Badge variant="secondary">{program.difficulty}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{lang === 'en' ? 'Program Structure' : 'Estructura del Programa'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {program.weeks.map((week) => (
                    <div key={week.id} className="border-l-2 border-emerald-500/30 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">
                          {lang === 'en' ? 'Week' : 'Semana'} {week.weekNumber}
                          {week.title && `: ${week.title}`}
                        </h3>
                        {week.weekFocus && (
                          <Badge variant="outline" className="text-xs">
                            {week.weekFocus}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-slate-400">
                        {week.days.map((day) => (
                          <div key={day.id} className="flex items-center gap-2">
                            {day.isRestDay ? (
                              <>
                                <span>Day {day.dayIndex}:</span>
                                <Badge variant="secondary" className="text-xs">
                                  {lang === 'en' ? 'Rest Day' : 'Día de Descanso'}
                                </Badge>
                              </>
                            ) : (
                              <>
                                <span>Day {day.dayIndex}:</span>
                                <span className="font-semibold text-slate-300">
                                  {day.workout?.name || day.title}
                                </span>
                                {day.workout?.estimatedDuration && (
                                  <span className="text-xs">({day.workout.estimatedDuration}m)</span>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{lang === 'en' ? 'Quick Actions' : 'Acciones Rápidas'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full" variant="default">
                  <Link href={`/coach/programs/${program.id}/planner`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {lang === 'en' ? 'Edit Schedule' : 'Editar Horario'}
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="secondary">
                  <Link href={`/coach/programs/${program.id}/planner`}>
                    <Eye className="w-4 h-4 mr-2" />
                    {lang === 'en' ? 'View Planner' : 'Ver Planificador'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

