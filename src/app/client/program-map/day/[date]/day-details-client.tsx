'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Dumbbell, Calendar, CheckCircle2, Play, Edit, Save, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Lang, translations } from '@/lib/i18n';
// Toast notifications - using alert for now, can be replaced with toast library
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg),
};

type DayDetails = {
  date: string;
  status: 'TODAY' | 'COMPLETED' | 'UPCOMING' | 'MISSED' | 'REST' | 'NO_PROGRAM' | 'NO_DAY';
  workout: {
    id: string;
    name: string;
    description?: string;
    estimatedDuration?: number;
    goal?: string;
    difficulty?: string;
    tags?: string[];
  } | null;
  session: {
    id: string;
    status: string;
    dateTimeStarted: string;
    dateTimeCompleted: string | null;
    clientNotes?: string;
  } | null;
  exerciseLogs: Array<{
    id: string;
    exerciseName: string;
    setNumber: number;
    targetReps: number;
    targetWeight: number | null;
    targetUnit: string;
    actualReps: number | null;
    actualWeight: number | null;
    actualUnit: string;
    feelingCode: string | null;
    feelingEmoji: string | null;
    feelingNote: string | null;
  }>;
  programDay: {
    id: string;
    title: string;
    isRestDay: boolean;
    notes?: string | null;
  };
};

const FEELING_OPTIONS = [
  { code: 'TOO_EASY', emoji: '😄', labelEn: 'Too Easy', labelEs: 'Demasiado fácil' },
  { code: 'GOOD_CHALLENGE', emoji: '🙂', labelEn: 'Good Challenge', labelEs: 'Buen desafío' },
  { code: 'HARD', emoji: '😓', labelEn: 'Hard', labelEs: 'Difícil' },
  { code: 'FAILED_REPS', emoji: '😵', labelEn: 'Failed Reps', labelEs: 'No completé' },
  { code: 'PAIN', emoji: '😣', labelEn: 'Pain', labelEs: 'Dolor' },
];

export function DayDetailsClient({ dayDetails, lang }: { dayDetails: DayDetails; lang: Lang }) {
  const router = useRouter();
  const t = translations.client[lang] || translations.client.en;
  const [isPending, startTransition] = useTransition();
  const [editingLogs, setEditingLogs] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Initialize editing logs from exercise logs
  useEffect(() => {
    if (dayDetails.exerciseLogs.length > 0) {
      const logs: Record<string, any> = {};
      dayDetails.exerciseLogs.forEach((log) => {
        logs[log.id] = {
          actualReps: log.actualReps || '',
          actualWeight: log.actualWeight || '',
          feelingCode: log.feelingCode || '',
          feelingEmoji: log.feelingEmoji || '',
          feelingNote: log.feelingNote || '',
        };
      });
      setEditingLogs(logs);
    }
  }, [dayDetails.exerciseLogs]);

  const handleStartWorkout = async () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/client/workouts/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dayDetails.date }),
        });
        const data = await res.json();
        if (data.sessionId) {
          router.push(`/client/workout/${data.sessionId}`);
        } else {
          toast.error(lang === 'en' ? 'Failed to start workout' : 'Error al iniciar entrenamiento');
        }
      } catch (error) {
        console.error('Error starting workout:', error);
        toast.error(lang === 'en' ? 'Error starting workout' : 'Error al iniciar entrenamiento');
      }
    });
  };

  const handleResumeWorkout = () => {
    if (dayDetails.session) {
      router.push(`/client/workout/${dayDetails.session.id}`);
    }
  };

  const handleSaveLogs = async () => {
    if (!dayDetails.session) return;

    startTransition(async () => {
      try {
        const setLogs = Object.entries(editingLogs).map(([id, log]) => ({
          id,
          actualReps: log.actualReps ? parseInt(log.actualReps) : null,
          actualWeight: log.actualWeight ? parseFloat(log.actualWeight) : null,
          feelingCode: log.feelingCode || null,
          feelingEmoji: log.feelingEmoji || null,
          feelingNote: log.feelingNote || null,
        }));

        const res = await fetch(`/api/client/workout-sessions/${dayDetails.session!.id}/exercise-logs`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setLogs }),
        });

        if (res.ok) {
          toast.success(lang === 'en' ? 'Logs saved successfully' : 'Registros guardados exitosamente');
          setIsEditing(false);
          router.refresh();
        } else {
          const error = await res.json();
          toast.error(error.error || (lang === 'en' ? 'Failed to save logs' : 'Error al guardar registros'));
        }
      } catch (error) {
        console.error('Error saving logs:', error);
        toast.error(lang === 'en' ? 'Error saving logs' : 'Error al guardar registros');
      }
    });
  };

  const getStatusBadge = () => {
    switch (dayDetails.status) {
      case 'TODAY':
        return <Badge variant="default">{lang === 'en' ? 'Today' : 'Hoy'}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-emerald-500">{lang === 'en' ? 'Completed' : 'Completado'}</Badge>;
      case 'UPCOMING':
        return <Badge variant="secondary">{lang === 'en' ? 'Upcoming' : 'Próximo'}</Badge>;
      case 'MISSED':
        return <Badge className="bg-red-500">{lang === 'en' ? 'Missed' : 'Perdido'}</Badge>;
      case 'REST':
        return <Badge variant="outline">{lang === 'en' ? 'Rest Day' : 'Día de Descanso'}</Badge>;
      default:
        return null;
    }
  };

  const getActionButton = () => {
    if (dayDetails.status === 'REST' || dayDetails.status === 'NO_PROGRAM' || dayDetails.status === 'NO_DAY') {
      return null;
    }

    if (dayDetails.status === 'TODAY') {
      if (dayDetails.session?.status === 'IN_PROGRESS') {
        return (
          <Button onClick={handleResumeWorkout} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Resume Workout' : 'Continuar Entrenamiento'}
          </Button>
        );
      } else if (dayDetails.session?.status === 'COMPLETED') {
        return (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Edit Log' : 'Editar Registro'}
          </Button>
        );
      } else {
        return (
          <Button onClick={handleStartWorkout} disabled={isPending} className="flex-1">
            <Dumbbell className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Start Workout' : 'Comenzar Entrenamiento'}
          </Button>
        );
      }
    } else if (dayDetails.status === 'UPCOMING' || dayDetails.status === 'MISSED') {
      return (
        <Button onClick={handleStartWorkout} disabled={isPending} variant="secondary">
          <Dumbbell className="w-4 h-4 mr-2" />
          {lang === 'en' ? 'Start This Workout' : 'Iniciar Este Entrenamiento'}
        </Button>
      );
    } else if (dayDetails.status === 'COMPLETED') {
      return (
        <Button variant="secondary" onClick={() => setIsEditing(true)}>
          <Edit className="w-4 h-4 mr-2" />
          {lang === 'en' ? 'View/Edit Log' : 'Ver/Editar Registro'}
        </Button>
      );
    }

    return null;
  };

  // Group logs by exercise
  const logsByExercise = dayDetails.exerciseLogs.reduce((acc, log) => {
    if (!acc[log.exerciseName]) {
      acc[log.exerciseName] = [];
    }
    acc[log.exerciseName].push(log);
    return acc;
  }, {} as Record<string, typeof dayDetails.exerciseLogs>);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Back' : 'Volver'}
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">
                {lang === 'en' ? 'Day Details' : 'Detalles del Día'}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <p className="text-slate-400">
                {new Date(dayDetails.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </header>

      {dayDetails.status === 'REST' ? (
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="py-12 text-center">
            <p className="text-slate-400 text-lg">
              {lang === 'en' ? 'Rest Day - No workout scheduled' : 'Día de Descanso - No hay entrenamiento programado'}
            </p>
            {dayDetails.programDay.notes && (
              <p className="text-slate-500 mt-2">{dayDetails.programDay.notes}</p>
            )}
          </CardContent>
        </Card>
      ) : !dayDetails.workout ? (
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="py-12 text-center">
            <p className="text-slate-400">
              {lang === 'en' ? 'No workout assigned for this day' : 'No hay entrenamiento asignado para este día'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Workout Summary */}
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-emerald-400" />
                  {dayDetails.workout.name}
                </CardTitle>
                {getActionButton()}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dayDetails.workout.description && (
                <p className="text-slate-300">{dayDetails.workout.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {dayDetails.workout.estimatedDuration && (
                  <Badge variant="outline">
                    {dayDetails.workout.estimatedDuration} {lang === 'en' ? 'min' : 'min'}
                  </Badge>
                )}
                {dayDetails.workout.goal && (
                  <Badge variant="outline">{dayDetails.workout.goal}</Badge>
                )}
                {dayDetails.workout.difficulty && (
                  <Badge variant="outline">{dayDetails.workout.difficulty}</Badge>
                )}
                {dayDetails.workout.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exercise Logs */}
          {dayDetails.exerciseLogs.length > 0 && (
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {lang === 'en' ? 'Exercise Logs' : 'Registros de Ejercicios'}
                  </CardTitle>
                  {dayDetails.status === 'COMPLETED' && !isEditing && (
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      {lang === 'en' ? 'Edit' : 'Editar'}
                    </Button>
                  )}
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4 mr-2" />
                        {lang === 'en' ? 'Cancel' : 'Cancelar'}
                      </Button>
                      <Button size="sm" onClick={handleSaveLogs} disabled={isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        {lang === 'en' ? 'Save' : 'Guardar'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(logsByExercise).map(([exerciseName, logs]) => (
                  <div key={exerciseName} className="space-y-3">
                    <h3 className="font-semibold text-lg">{exerciseName}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 px-3">{lang === 'en' ? 'Set' : 'Serie'}</th>
                            <th className="text-right py-2 px-3">{lang === 'en' ? 'Target Reps' : 'Reps Objetivo'}</th>
                            <th className="text-right py-2 px-3">{lang === 'en' ? 'Actual Reps' : 'Reps Realizadas'}</th>
                            <th className="text-right py-2 px-3">{lang === 'en' ? 'Target Weight' : 'Peso Objetivo'}</th>
                            <th className="text-right py-2 px-3">{lang === 'en' ? 'Actual Weight' : 'Peso Real'}</th>
                            <th className="text-center py-2 px-3">{lang === 'en' ? 'Feeling' : 'Sensación'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((log) => {
                            const editLog = editingLogs[log.id] || {};
                            return (
                              <tr key={log.id} className="border-b border-slate-800">
                                <td className="py-2 px-3 font-medium">{log.setNumber}</td>
                                <td className="py-2 px-3 text-right text-slate-400">{log.targetReps}</td>
                                <td className="py-2 px-3 text-right">
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      value={editLog.actualReps || ''}
                                      onChange={(e) =>
                                        setEditingLogs({
                                          ...editingLogs,
                                          [log.id]: { ...editLog, actualReps: e.target.value },
                                        })
                                      }
                                      className="w-20 bg-slate-800 border-slate-700"
                                    />
                                  ) : (
                                    log.actualReps || '-'
                                  )}
                                </td>
                                <td className="py-2 px-3 text-right text-slate-400">
                                  {log.targetWeight ? `${log.targetWeight} ${log.targetUnit}` : '-'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={editLog.actualWeight || ''}
                                      onChange={(e) =>
                                        setEditingLogs({
                                          ...editingLogs,
                                          [log.id]: { ...editLog, actualWeight: e.target.value },
                                        })
                                      }
                                      className="w-24 bg-slate-800 border-slate-700"
                                    />
                                  ) : (
                                    log.actualWeight ? `${log.actualWeight} ${log.actualUnit}` : '-'
                                  )}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {isEditing ? (
                                    <div className="flex items-center justify-center gap-1">
                                      {FEELING_OPTIONS.map((feeling) => (
                                        <button
                                          key={feeling.code}
                                          onClick={() =>
                                            setEditingLogs({
                                              ...editingLogs,
                                              [log.id]: {
                                                ...editLog,
                                                feelingCode: feeling.code,
                                                feelingEmoji: feeling.emoji,
                                              },
                                            })
                                          }
                                          className={`text-2xl p-1 rounded ${
                                            editLog.feelingCode === feeling.code
                                              ? 'bg-emerald-500/20 ring-2 ring-emerald-500'
                                              : 'hover:bg-slate-800'
                                          }`}
                                          title={lang === 'en' ? feeling.labelEn : feeling.labelEs}
                                        >
                                          {feeling.emoji}
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    log.feelingEmoji || '-'
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

