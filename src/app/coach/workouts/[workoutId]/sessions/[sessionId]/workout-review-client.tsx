'use client';

import Link from 'next/link';
import { ArrowLeft, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';

const FEELING_EMOJIS: Record<string, { emoji: string; labelEn: string; labelEs: string }> = {
  TOO_EASY: { emoji: '😄', labelEn: 'Too Easy', labelEs: 'Demasiado fácil' },
  GOOD_CHALLENGE: { emoji: '🙂', labelEn: 'Good Challenge', labelEs: 'Buen desafío' },
  HARD: { emoji: '😓', labelEn: 'Hard', labelEs: 'Difícil' },
  FAILED_REPS: { emoji: '😵', labelEn: 'Failed Reps', labelEs: 'No completé' },
  PAIN: { emoji: '😣', labelEn: 'Pain / Wrong', labelEs: 'Dolor / mal' },
};

export default function WorkoutReviewClient({
  session,
  lang,
}: {
  session: any;
  lang: Lang;
}) {
  const t = translations.coachClientDetails[lang] || translations.coachClientDetails.en;

  // Group set logs by exercise
  const exerciseLogs: Record<string, any[]> = {};
  session.setLogs.forEach((log: any) => {
    const key = log.workoutExerciseId;
    if (!exerciseLogs[key]) {
      exerciseLogs[key] = [];
    }
    exerciseLogs[key].push(log);
  });

  // Check for pain reports
  const painReports = session.setLogs.filter((log: any) => log.feelingCode === 'PAIN');

  // Calculate exercise summaries
  const getExerciseSummary = (exerciseId: string) => {
    const logs = exerciseLogs[exerciseId] || [];
    const completed = logs.filter((l: any) => l.actualReps && l.actualWeight !== null).length;
    const total = logs.length;
    const weights = logs.map((l: any) => l.actualWeight).filter((w: any) => w !== null);
    const maxWeight = weights.length > 0 ? Math.max(...weights) : null;
    const feelings = logs.map((l: any) => l.feelingCode).filter((f: any) => f);
    const hasPain = feelings.includes('PAIN');
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      completed,
      total,
      completionRate,
      maxWeight,
      hasPain,
      feelings,
    };
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">{session.workout.name}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {session.client?.name || 'Client'} • {new Date(session.dateTimeStarted).toLocaleDateString()}
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/coach/clients/${session.clientId}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t.back}
            </Link>
          </Button>
        </div>

        {/* Pain Warning */}
        {painReports.length > 0 && (
          <Card className="mb-6 border-red-500/30 bg-red-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <p className="font-semibold text-red-400">
                  {lang === 'en' ? 'Pain Reported' : 'Dolor Reportado'}
                </p>
                <p className="text-sm text-slate-300">
                  {lang === 'en'
                    ? `${painReports.length} set(s) with pain reported. Review details below.`
                    : `${painReports.length} serie(s) con dolor reportado. Revisa los detalles a continuación.`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workout Sections */}
        <div className="space-y-6">
          {session.workout.sections.map((section: any) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.blocks.map((block: any) => (
                  <div key={block.id} className="border-t border-slate-800 pt-4">
                    {block.title && (
                      <h3 className="font-semibold mb-3">{block.title}</h3>
                    )}

                    {/* Exercises */}
                    <div className="space-y-4">
                      {block.exercises.map((exercise: any) => {
                        const summary = getExerciseSummary(exercise.id);
                        const logs = exerciseLogs[exercise.id] || [];

                        return (
                          <div key={exercise.id} className="bg-slate-900/60 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-lg">{exercise.name}</h4>
                                {exercise.notes && (
                                  <p className="text-sm text-slate-400 mt-1">{exercise.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={summary.hasPain ? 'destructive' : 'success'}>
                                  {Math.round(summary.completionRate)}% {lang === 'en' ? 'Complete' : 'Completo'}
                                </Badge>
                                {summary.maxWeight && (
                                  <Badge variant="default">
                                    {lang === 'en' ? 'Max' : 'Máx'}: {summary.maxWeight}kg
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Sets Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-800">
                                    <th className="text-left py-2 px-2 text-slate-400">{lang === 'en' ? 'Set' : 'Serie'}</th>
                                    <th className="text-left py-2 px-2 text-slate-400">{lang === 'en' ? 'Target' : 'Objetivo'}</th>
                                    <th className="text-left py-2 px-2 text-slate-400">{lang === 'en' ? 'Actual' : 'Real'}</th>
                                    <th className="text-left py-2 px-2 text-slate-400">{lang === 'en' ? 'Feeling' : 'Sensación'}</th>
                                    <th className="text-left py-2 px-2 text-slate-400">{lang === 'en' ? 'Notes' : 'Notas'}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {logs.map((log: any) => {
                                    const targetReps = (exercise.targetRepsBySet as number[])?.[log.setNumber - 1] || 0;
                                    const targetWeight = (exercise.targetWeightBySet as (number | null)[])?.[log.setNumber - 1];
                                    const feeling = FEELING_EMOJIS[log.feelingCode || 'GOOD_CHALLENGE'];

                                    return (
                                      <tr
                                        key={log.id}
                                        className={`border-b border-slate-800 ${
                                          log.feelingCode === 'PAIN' ? 'bg-red-500/10' : ''
                                        }`}
                                      >
                                        <td className="py-2 px-2 font-semibold">{log.setNumber}</td>
                                        <td className="py-2 px-2 text-slate-400">
                                          {targetReps} {targetWeight ? `@ ${targetWeight}kg` : 'reps'}
                                        </td>
                                        <td className="py-2 px-2">
                                          {log.actualReps && log.actualWeight !== null ? (
                                            <span>
                                              {log.actualReps} @ {log.actualWeight}kg
                                            </span>
                                          ) : (
                                            <span className="text-slate-500">—</span>
                                          )}
                                        </td>
                                        <td className="py-2 px-2">
                                          {log.feelingEmoji && (
                                            <span className="text-xl" title={lang === 'en' ? feeling.labelEn : feeling.labelEs}>
                                              {log.feelingEmoji}
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 px-2 text-slate-400 text-xs">
                                          {log.feelingNote || '—'}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Session Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {lang === 'en' ? 'Session Summary' : 'Resumen de Sesión'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400">{lang === 'en' ? 'Status' : 'Estado'}</p>
                <p className="text-lg font-semibold">
                  {session.status === 'COMPLETED' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === 'en' ? 'Completed' : 'Completado'}
                    </span>
                  ) : (
                    <span className="text-yellow-400">{lang === 'en' ? 'In Progress' : 'En Progreso'}</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{lang === 'en' ? 'Duration' : 'Duración'}</p>
                <p className="text-lg font-semibold">
                  {session.dateTimeCompleted && session.dateTimeStarted
                    ? `${Math.round((new Date(session.dateTimeCompleted).getTime() - new Date(session.dateTimeStarted).getTime()) / 60000)} min`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{lang === 'en' ? 'Total Sets' : 'Series Totales'}</p>
                <p className="text-lg font-semibold">{session.setLogs.length}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{lang === 'en' ? 'Pain Reports' : 'Reportes de Dolor'}</p>
                <p className="text-lg font-semibold text-red-400">{painReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

