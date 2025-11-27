'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  AlertTriangle,
  Dumbbell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';
import { logSet, completeSession } from './actions';

const FEELING_EMOJIS = [
  { code: 'TOO_EASY', emoji: '😄', labelEn: 'Too Easy', labelEs: 'Demasiado fácil' },
  { code: 'GOOD_CHALLENGE', emoji: '🙂', labelEn: 'Good Challenge', labelEs: 'Buen desafío' },
  { code: 'HARD', emoji: '😓', labelEn: 'Hard', labelEs: 'Difícil' },
  { code: 'FAILED_REPS', emoji: '😵', labelEn: 'Failed Reps', labelEs: 'No completé' },
  { code: 'PAIN', emoji: '😣', labelEn: 'Pain / Wrong', labelEs: 'Dolor / mal' },
];

export default function WorkoutExecutionClient({
  session,
  clientId,
  lang,
}: {
  session: any;
  clientId: string;
  lang: Lang;
}) {
  const router = useRouter();
  const t = translations.client[lang] || translations.client.en;
  const [saving, setSaving] = useState(false);
  const [setLogs, setSetLogs] = useState<Record<string, any>>({});
  const [showPainPrompt, setShowPainPrompt] = useState<string | null>(null);
  const [painNote, setPainNote] = useState('');

  // Initialize set logs from existing data
  useEffect(() => {
    const logs: Record<string, any> = {};
    session.setLogs?.forEach((log: any) => {
      const key = `${log.workoutExerciseId}-${log.setNumber}`;
      logs[key] = {
        actualReps: log.actualReps,
        actualWeight: log.actualWeight,
        feelingCode: log.feelingCode,
        feelingEmoji: log.feelingEmoji,
        feelingNote: log.feelingNote,
      };
    });
    setSetLogs(logs);
  }, [session.setLogs]);

  const updateSetLog = async (
    exerciseId: string,
    setNumber: number,
    field: 'actualReps' | 'actualWeight' | 'feelingCode' | 'feelingEmoji' | 'feelingNote',
    value: any
  ) => {
    const key = `${exerciseId}-${setNumber}`;
    const currentLog = setLogs[key] || {};
    const updatedLog = { ...currentLog, [field]: value };

    setSetLogs({ ...setLogs, [key]: updatedLog });

    // Autosave
    try {
      await logSet({
        sessionId: session.id,
        workoutExerciseId: exerciseId,
        setNumber,
        actualReps: updatedLog.actualReps,
        actualWeight: updatedLog.actualWeight,
        feelingCode: updatedLog.feelingCode,
        feelingEmoji: updatedLog.feelingEmoji,
        feelingNote: updatedLog.feelingNote,
      });
    } catch (error) {
      console.error('Error saving set log:', error);
    }
  };

  const handleFeelingClick = async (
    exerciseId: string,
    setNumber: number,
    feeling: typeof FEELING_EMOJIS[0]
  ) => {
    if (feeling.code === 'PAIN') {
      setShowPainPrompt(`${exerciseId}-${setNumber}`);
      return;
    }

    await updateSetLog(exerciseId, setNumber, 'feelingCode', feeling.code);
    await updateSetLog(exerciseId, setNumber, 'feelingEmoji', feeling.emoji);
  };

  const handlePainConfirm = async (exerciseId: string, setNumber: number) => {
    await updateSetLog(exerciseId, setNumber, 'feelingCode', 'PAIN');
    await updateSetLog(exerciseId, setNumber, 'feelingEmoji', '😣');
    if (painNote) {
      await updateSetLog(exerciseId, setNumber, 'feelingNote', painNote);
    }
    setShowPainPrompt(null);
    setPainNote('');

    // Notify coach
    // This would trigger a notification in a real implementation
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await completeSession(session.id);
      router.push('/client/today');
    } catch (error) {
      console.error('Error completing session:', error);
      alert(lang === 'en' ? 'Error completing workout' : 'Error al completar entrenamiento');
    } finally {
      setSaving(false);
    }
  };

  const getSetLog = (exerciseId: string, setNumber: number) => {
    return setLogs[`${exerciseId}-${setNumber}`] || {};
  };

  const isSetComplete = (exerciseId: string, setNumber: number) => {
    const log = getSetLog(exerciseId, setNumber);
    return log.actualReps && log.actualWeight !== undefined && log.feelingCode;
  };

  const getExerciseSummary = (exercise: any) => {
    const logs = exercise.targetRepsBySet.map((_: any, idx: number) =>
      getSetLog(exercise.id, idx + 1)
    );
    const completedSets = logs.filter((l: any) => isSetComplete(exercise.id, logs.indexOf(l) + 1));
    const weights = logs.map((l: any) => l.actualWeight).filter((w: any) => w);
    const maxWeight = weights.length > 0 ? Math.max(...weights) : null;
    const feelings = logs.map((l: any) => l.feelingCode).filter((f: any) => f);
    const worstFeeling = feelings.includes('PAIN') ? 'PAIN' :
                         feelings.includes('FAILED_REPS') ? 'FAILED_REPS' :
                         feelings.includes('HARD') ? 'HARD' :
                         feelings.includes('GOOD_CHALLENGE') ? 'GOOD_CHALLENGE' : 'TOO_EASY';
    const feelingEmoji = FEELING_EMOJIS.find(f => f.code === worstFeeling)?.emoji || '🙂';

    return {
      completed: completedSets.length,
      total: exercise.targetRepsBySet.length,
      maxWeight,
      feeling: feelingEmoji,
    };
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">{session.workout.name}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {lang === 'en' ? 'Log your sets as you complete them' : 'Registra tus series mientras las completas'}
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/client/today">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t.back}
            </Link>
          </Button>
        </div>

        {/* Workout Sections */}
        <div className="space-y-6">
          {session.workout.sections.map((section: any) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.name}</CardTitle>
                {section.notes && (
                  <p className="text-sm text-slate-400 mt-1">{section.notes}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {section.blocks.map((block: any) => (
                  <div key={block.id} className="border-t border-slate-800 pt-4">
                    {block.title && (
                      <h3 className="font-semibold mb-3">{block.title}</h3>
                    )}
                    {block.instructions && (
                      <p className="text-sm text-slate-400 mb-3">{block.instructions}</p>
                    )}

                    {/* Exercises */}
                    <div className="space-y-4">
                      {block.exercises.map((exercise: any) => {
                        const summary = getExerciseSummary(exercise);
                        return (
                          <div key={exercise.id} className="bg-slate-900/60 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-lg">{exercise.name}</h4>
                                {exercise.notes && (
                                  <p className="text-sm text-slate-400 mt-1">{exercise.notes}</p>
                                )}
                              </div>
                              {summary.completed > 0 && (
                                <Badge variant="success">
                                  {summary.completed}/{summary.total} {lang === 'en' ? 'sets' : 'series'}
                                  {summary.maxWeight && ` · ${summary.maxWeight}kg`}
                                  {` · ${summary.feeling}`}
                                </Badge>
                              )}
                            </div>

                            {/* Sets Table */}
                            <div className="space-y-2">
                              <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 mb-2">
                                <div className="col-span-1">{lang === 'en' ? 'Set' : 'Serie'}</div>
                                <div className="col-span-2">{lang === 'en' ? 'Target' : 'Objetivo'}</div>
                                <div className="col-span-2">{lang === 'en' ? 'Weight' : 'Peso'}</div>
                                <div className="col-span-2">{lang === 'en' ? 'Reps' : 'Reps'}</div>
                                <div className="col-span-5">{lang === 'en' ? 'Feeling' : 'Sensación'}</div>
                              </div>

                              {exercise.targetRepsBySet.map((targetReps: number, setIdx: number) => {
                                const setNumber = setIdx + 1;
                                const targetWeight = exercise.targetWeightBySet?.[setIdx];
                                const log = getSetLog(exercise.id, setNumber);
                                const completed = isSetComplete(exercise.id, setNumber);

                                return (
                                  <div
                                    key={setIdx}
                                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded ${
                                      completed ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/40'
                                    }`}
                                  >
                                    <div className="col-span-1 text-sm font-semibold">
                                      {setNumber}
                                    </div>
                                    <div className="col-span-2 text-sm">
                                      {targetReps} {targetWeight ? `@ ${targetWeight}kg` : lang === 'en' ? 'reps - choose weight' : 'reps - elige peso'}
                                    </div>
                                    <div className="col-span-2">
                                      <input
                                        type="number"
                                        value={log.actualWeight || ''}
                                        onChange={(e) => updateSetLog(exercise.id, setNumber, 'actualWeight', e.target.value ? parseFloat(e.target.value) : null)}
                                        onBlur={() => {}}
                                        placeholder="kg"
                                        className="w-full px-2 py-1 rounded bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
                                      />
                                    </div>
                                    <div className="col-span-2">
                                      <input
                                        type="number"
                                        value={log.actualReps || ''}
                                        onChange={(e) => updateSetLog(exercise.id, setNumber, 'actualReps', e.target.value ? parseInt(e.target.value) : null)}
                                        onBlur={() => {}}
                                        placeholder={targetReps.toString()}
                                        className="w-full px-2 py-1 rounded bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
                                      />
                                    </div>
                                    <div className="col-span-5 flex gap-1">
                                      {FEELING_EMOJIS.map((feeling) => (
                                        <button
                                          key={feeling.code}
                                          onClick={() => handleFeelingClick(exercise.id, setNumber, feeling)}
                                          className={`text-2xl p-1 rounded transition-all ${
                                            log.feelingCode === feeling.code
                                              ? 'bg-emerald-500/30 scale-110'
                                              : 'hover:bg-slate-700/50'
                                          }`}
                                          title={lang === 'en' ? feeling.labelEn : feeling.labelEs}
                                        >
                                          {feeling.emoji}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
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

        {/* Complete Button */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleComplete} disabled={saving} size="lg">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {saving
              ? (lang === 'en' ? 'Completing...' : 'Completando...')
              : (lang === 'en' ? 'Complete Workout' : 'Completar Entrenamiento')}
          </Button>
        </div>

        {/* Pain Prompt Modal */}
        {showPainPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  {lang === 'en' ? 'Are you okay?' : '¿Estás bien?'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  {lang === 'en'
                    ? 'You reported pain. Please add a note and we\'ll notify your coach.'
                    : 'Reportaste dolor. Por favor agrega una nota y notificaremos a tu entrenador.'}
                </p>
                <textarea
                  value={painNote}
                  onChange={(e) => setPainNote(e.target.value)}
                  placeholder={lang === 'en' ? 'Describe what happened...' : 'Describe qué pasó...'}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const [exerciseId, setNumber] = showPainPrompt.split('-');
                      handlePainConfirm(exerciseId, parseInt(setNumber));
                    }}
                    className="flex-1"
                  >
                    {lang === 'en' ? 'Confirm & Notify Coach' : 'Confirmar y Notificar Entrenador'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowPainPrompt(null);
                      setPainNote('');
                    }}
                  >
                    {lang === 'en' ? 'Cancel' : 'Cancelar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

