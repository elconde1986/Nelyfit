'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Clock,
  Save,
  Plus,
  MoreVertical,
  Play,
  Pause,
  CheckCircle2,
  Flame,
  Heart,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lang } from '@/lib/i18n';
// Toast notifications handled via state

type SessionView = {
  session: {
    id: string;
    performedAt: string;
    completionStatus: string;
    totalTimeSeconds: number;
    xpEarned: number;
  };
  workout: {
    id: string;
    name: string;
    estimatedDurationMinutes: number;
  };
  exercises: Array<{
    workoutExerciseId: string;
    exerciseId: string | null;
    name: string;
    prescription: string;
    restSeconds: number;
    thumbUrl: string | null;
    logs: {
      setLogs: Array<{
        setIndex: number;
        plannedReps: number;
        actualReps: number | null;
        plannedWeight: number | null;
        actualWeight: number | null;
        isExtraSet: boolean;
      }>;
    };
    previousSessionSetLogs: Array<{
      setIndex: number;
      reps: number;
      weight: number;
    }>;
  }>;
  metrics: {
    activeCalories: number | null;
    heartRate: number | null;
    heartRateZone: number | null;
  };
};

type RestTimer = {
  exerciseId: string;
  secondsRemaining: number;
  isActive: boolean;
};

export default function WorkoutExecutionNew({
  sessionId,
  initialLang,
}: {
  sessionId: string;
  initialLang: Lang;
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(initialLang);
  const [sessionView, setSessionView] = useState<SessionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showInsertExercise, setShowInsertExercise] = useState(false);
  const [restTimers, setRestTimers] = useState<Record<string, RestTimer>>({});
  const [editingSet, setEditingSet] = useState<{ exerciseId: string; setIndex: number } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Exercise library search state
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [exerciseSearchResults, setExerciseSearchResults] = useState<any[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [exerciseSearchFilters, setExerciseSearchFilters] = useState({
    modality: '',
    bodyRegion: '',
    equipment: '',
    difficulty: '',
  });

  // Search exercises function
  const searchExercises = useCallback(async (query: string, filters?: typeof exerciseSearchFilters) => {
    const activeFilters = filters || exerciseSearchFilters;
    setLoadingExercises(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (activeFilters.modality) params.append('modality', activeFilters.modality);
      if (activeFilters.bodyRegion) params.append('bodyRegion', activeFilters.bodyRegion);
      if (activeFilters.equipment) params.append('equipment', activeFilters.equipment);
      if (activeFilters.difficulty) params.append('difficulty', activeFilters.difficulty);
      params.append('library', 'true'); // Only show library exercises

      const response = await fetch(`/api/exercises?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExerciseSearchResults(data.exercises || []);
      }
    } catch (error) {
      console.error('Error searching exercises:', error);
      setExerciseSearchResults([]);
    } finally {
      setLoadingExercises(false);
    }
  }, [exerciseSearchFilters]);

  // Load session view
  useEffect(() => {
    loadSessionView();
  }, [sessionId]);

  // Load exercises when modal opens
  useEffect(() => {
    if (showInsertExercise && exerciseSearchQuery === '') {
      searchExercises(''); // Load all exercises initially
    }
  }, [showInsertExercise, searchExercises, exerciseSearchQuery]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && sessionView) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, sessionView]);

  // Rest timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRestTimers((timers) => {
        const updated: Record<string, RestTimer> = {};
        for (const [key, timer] of Object.entries(timers)) {
          if (timer.isActive && timer.secondsRemaining > 0) {
            updated[key] = {
              ...timer,
              secondsRemaining: timer.secondsRemaining - 1,
            };
          } else if (timer.isActive && timer.secondsRemaining === 0) {
            updated[key] = { ...timer, isActive: false };
            // Haptic feedback or notification could go here
          } else {
            updated[key] = timer;
          }
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSessionView = async () => {
    try {
      const response = await fetch(`/api/client/workout-sessions/${sessionId}/view`);
      if (!response.ok) throw new Error('Failed to load session');
      const data = await response.json();
      setSessionView(data);
      
      // Initialize timer from session start time
      if (data.session.performedAt) {
        const startTime = new Date(data.session.performedAt).getTime();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimerSeconds(elapsed);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading session view:', error);
      setNotification({ message: lang === 'en' ? 'Failed to load workout' : 'Error al cargar entrenamiento', type: 'error' });
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!sessionView) return;

    setSaving(true);
    try {
      // Collect all exercise logs
      const exerciseLogs = sessionView.exercises.map((exercise) => ({
        workoutExerciseId: exercise.workoutExerciseId,
        setLogs: exercise.logs.setLogs.map((setLog) => ({
          setIndex: setLog.setIndex,
          actualReps: setLog.actualReps,
          actualWeight: setLog.actualWeight,
          isExtraSet: setLog.isExtraSet,
        })),
      }));

      const response = await fetch(`/api/client/workout-sessions/${sessionId}/exercise-logs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseLogs }),
      });

      if (!response.ok) throw new Error('Failed to save');
      
      setNotification({ message: lang === 'en' ? 'Workout saved' : 'Entrenamiento guardado', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error saving workout:', error);
      setNotification({ message: lang === 'en' ? 'Failed to save workout' : 'Error al guardar entrenamiento', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (abandon: boolean) => {
    if (abandon) {
      try {
        await fetch(`/api/client/workout-sessions/${sessionId}/exercise-logs`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ABANDONED' }),
        });
        router.push('/client/today');
      } catch (error) {
        console.error('Error abandoning workout:', error);
      }
    } else {
      setShowCancelDialog(false);
    }
  };

  const handleComplete = async () => {
    if (!sessionView) return;

    setSaving(true);
    try {
      // Save logs first
      await handleSave();

      // Complete session
      const response = await fetch(`/api/client/workout-sessions/${sessionId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notesFromClient: '' }),
      });

      if (!response.ok) throw new Error('Failed to complete');
      
      const data = await response.json();
      
      // Show celebration and redirect
      router.push(`/client/today?completed=true&xp=${data.gamification.xpEarned || 0}`);
    } catch (error) {
      console.error('Error completing workout:', error);
      setNotification({ message: lang === 'en' ? 'Failed to complete workout' : 'Error al completar entrenamiento', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateSetLog = (exerciseId: string, setIndex: number, field: 'actualReps' | 'actualWeight', value: number | null) => {
    if (!sessionView) return;

    setSessionView({
      ...sessionView,
      exercises: sessionView.exercises.map((ex) => {
        if (ex.workoutExerciseId === exerciseId) {
          return {
            ...ex,
            logs: {
              setLogs: ex.logs.setLogs.map((setLog) => {
                if (setLog.setIndex === setIndex) {
                  return { ...setLog, [field]: value };
                }
                return setLog;
              }),
            },
          };
        }
        return ex;
      }),
    });
  };

  const addNewSet = (exerciseId: string) => {
    if (!sessionView) return;

    setSessionView({
      ...sessionView,
      exercises: sessionView.exercises.map((ex) => {
        if (ex.workoutExerciseId === exerciseId) {
          const maxSetIndex = Math.max(...ex.logs.setLogs.map((s) => s.setIndex), 0);
          const lastSet = ex.logs.setLogs[ex.logs.setLogs.length - 1];
          return {
            ...ex,
            logs: {
              setLogs: [
                ...ex.logs.setLogs,
                {
                  setIndex: maxSetIndex + 1,
                  plannedReps: lastSet?.plannedReps || 8,
                  actualReps: null,
                  plannedWeight: lastSet?.plannedWeight || null,
                  actualWeight: null,
                  isExtraSet: true,
                },
              ],
            },
          };
        }
        return ex;
      }),
    });
  };


  const handleInsertExercise = async (exercise: any) => {
    // Note: This would require a server action to add an exercise to the workout session
    // For now, we'll just show a notification that this feature needs backend support
    setNotification({
      message: lang === 'en' 
        ? `Exercise "${exercise.name}" selected. Backend integration needed.` 
        : `Ejercicio "${exercise.name}" seleccionado. Se necesita integración del backend.`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 3000);
    setShowInsertExercise(false);
    setExerciseSearchQuery('');
    setExerciseSearchResults([]);
  };

  const startRestTimer = (exerciseId: string, restSeconds: number) => {
    setRestTimers({
      ...restTimers,
      [exerciseId]: {
        exerciseId,
        secondsRemaining: restSeconds,
        isActive: true,
      },
    });
  };

  if (loading || !sessionView) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-400">{lang === 'en' ? 'Loading workout...' : 'Cargando entrenamiento...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 safe-top safe-bottom">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Top App Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCancelDialog(true)}
            className="text-slate-400 hover:text-slate-50"
          >
            <X className="w-5 h-5 mr-2" />
            {lang === 'en' ? 'Cancel' : 'Cancelar'}
          </Button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors"
            >
              {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="text-sm font-mono">{formatTime(timerSeconds)}</span>
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <Save className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Save' : 'Guardar'}
          </Button>
        </div>

        {/* Session Stats Ribbon */}
        <div className="flex items-center justify-around px-4 py-3 bg-slate-800/50 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <div className="text-xs text-slate-400">{lang === 'en' ? 'TIME' : 'TIEMPO'}</div>
              <div className="text-sm font-semibold">{formatTime(timerSeconds)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-slate-400" />
            <div>
              <div className="text-xs text-slate-400">{lang === 'en' ? 'Active Calories' : 'Calorías Activas'}</div>
              <div className="text-sm font-semibold">
                {sessionView.metrics.activeCalories || '—'} {lang === 'en' ? 'Cal' : 'Cal'}
              </div>
            </div>
          </div>

          {sessionView.metrics.heartRate ? (
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">
                  {lang === 'en' ? `Zone ${sessionView.metrics.heartRateZone}` : `Zona ${sessionView.metrics.heartRateZone}`}
                </div>
                <div className="text-sm font-semibold">{sessionView.metrics.heartRate} bpm</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs text-slate-400">{lang === 'en' ? 'Intensity' : 'Intensidad'}</div>
                <div className="text-sm font-semibold text-slate-500">—</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exercise List */}
      <div className="pb-32">
        {sessionView.exercises.map((exercise, exerciseIdx) => {
          const restTimer = restTimers[exercise.workoutExerciseId];
          const isResting = restTimer?.isActive;

          return (
            <Card key={exercise.workoutExerciseId} className="m-4 bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                {/* Exercise Header */}
                <div className="flex items-start gap-3 mb-4">
                  {exercise.thumbUrl ? (
                    <img
                      src={exercise.thumbUrl}
                      alt={exercise.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center">
                      <span className="text-2xl">💪</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{exercise.name}</h3>
                    <p className="text-sm text-slate-400">{exercise.prescription}</p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-200">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Rest Timer Row */}
                {exercise.restSeconds > 0 && (
                  <div className="flex items-center justify-between mb-3 p-2 bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-400">
                      {lang === 'en' ? 'Rest between each set' : 'Descanso entre series'}
                    </span>
                    <button
                      onClick={() => startRestTimer(exercise.workoutExerciseId, exercise.restSeconds)}
                      className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
                      disabled={isResting}
                    >
                      <Timer className="w-4 h-4" />
                      {isResting ? (
                        <span className="text-sm font-mono">{formatTime(restTimer.secondsRemaining)}</span>
                      ) : (
                        <span className="text-sm">{exercise.restSeconds}s</span>
                      )}
                    </button>
                  </div>
                )}

                {/* Per-Set Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs text-slate-400 mb-2 px-2">
                    <div>{lang === 'en' ? 'Set' : 'Serie'}</div>
                    <div>{lang === 'en' ? 'Previous' : 'Anterior'}</div>
                    <div>{lang === 'en' ? 'Reps' : 'Reps'}</div>
                    <div>{lang === 'en' ? 'Lbs' : 'Kg'}</div>
                  </div>

                  {exercise.logs.setLogs.map((setLog, setIdx) => {
                    const previous = exercise.previousSessionSetLogs.find((p) => p.setIndex === setLog.setIndex);
                    const isEditing = editingSet?.exerciseId === exercise.workoutExerciseId && editingSet?.setIndex === setLog.setIndex;

                    return (
                      <div
                        key={setLog.setIndex}
                        className={`grid grid-cols-4 gap-2 p-2 rounded-lg transition-colors ${
                          isEditing ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-slate-800/50 hover:bg-slate-800'
                        }`}
                        onClick={() => setEditingSet({ exerciseId: exercise.workoutExerciseId, setIndex: setLog.setIndex })}
                      >
                        <div className="text-sm font-semibold text-center">{setLog.setIndex}</div>
                        <div className="text-sm text-slate-400 text-center">
                          {previous ? `${previous.reps} × ${previous.weight}kg` : '—'}
                        </div>
                        <input
                          type="number"
                          value={setLog.actualReps || ''}
                          onChange={(e) => updateSetLog(exercise.workoutExerciseId, setLog.setIndex, 'actualReps', e.target.value ? parseInt(e.target.value) : null)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={setLog.plannedReps.toString()}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="number"
                          value={setLog.actualWeight || ''}
                          onChange={(e) => updateSetLog(exercise.workoutExerciseId, setLog.setIndex, 'actualWeight', e.target.value ? parseFloat(e.target.value) : null)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={setLog.plannedWeight?.toString() || '0'}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    );
                  })}

                  {/* Add New Set */}
                  <button
                    onClick={() => addNewSet(exercise.workoutExerciseId)}
                    className="w-full flex items-center justify-center gap-2 p-2 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">{lang === 'en' ? 'Add new set' : 'Agregar serie'}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Global Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 p-4 safe-bottom">
        <div className="max-w-md mx-auto space-y-2">
          <Button
            onClick={() => setShowInsertExercise(true)}
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Insert Exercise' : 'Insertar Ejercicio'}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            size="lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {lang === 'en' ? 'Finish Workout' : 'Finalizar Entrenamiento'}
          </Button>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">{lang === 'en' ? 'Discard this workout?' : '¿Descartar este entrenamiento?'}</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => handleCancel(true)}
                  variant="destructive"
                  className="w-full"
                >
                  {lang === 'en' ? 'Discard' : 'Descartar'}
                </Button>
                <Button
                  onClick={() => handleCancel(false)}
                  variant="outline"
                  className="w-full border-slate-700"
                >
                  {lang === 'en' ? 'Keep working' : 'Seguir trabajando'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insert Exercise Modal */}
      {showInsertExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 bg-slate-900 border-slate-800 max-h-[80vh] flex flex-col">
            <CardContent className="p-6 flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{lang === 'en' ? 'Insert Exercise' : 'Insertar Ejercicio'}</h3>
                <button onClick={() => {
                  setShowInsertExercise(false);
                  setExerciseSearchQuery('');
                  setExerciseSearchResults([]);
                }} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  value={exerciseSearchQuery}
                  onChange={(e) => {
                    setExerciseSearchQuery(e.target.value);
                    searchExercises(e.target.value);
                  }}
                  placeholder={lang === 'en' ? 'Search exercises...' : 'Buscar ejercicios...'}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <select
                  value={exerciseSearchFilters.modality}
                  onChange={(e) => {
                    const newFilters = { ...exerciseSearchFilters, modality: e.target.value };
                    setExerciseSearchFilters(newFilters);
                    searchExercises(exerciseSearchQuery, newFilters);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                >
                  <option value="">{lang === 'en' ? 'All Types' : 'Todos'}</option>
                  <option value="strength">{lang === 'en' ? 'Strength' : 'Fuerza'}</option>
                  <option value="cardio">{lang === 'en' ? 'Cardio' : 'Cardio'}</option>
                  <option value="mobility">{lang === 'en' ? 'Mobility' : 'Movilidad'}</option>
                  <option value="core">{lang === 'en' ? 'Core' : 'Core'}</option>
                </select>
                <select
                  value={exerciseSearchFilters.bodyRegion}
                  onChange={(e) => {
                    const newFilters = { ...exerciseSearchFilters, bodyRegion: e.target.value };
                    setExerciseSearchFilters(newFilters);
                    searchExercises(exerciseSearchQuery, newFilters);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                >
                  <option value="">{lang === 'en' ? 'All Regions' : 'Todas'}</option>
                  <option value="upper">{lang === 'en' ? 'Upper' : 'Superior'}</option>
                  <option value="lower">{lang === 'en' ? 'Lower' : 'Inferior'}</option>
                  <option value="core">{lang === 'en' ? 'Core' : 'Core'}</option>
                  <option value="full">{lang === 'en' ? 'Full Body' : 'Cuerpo Completo'}</option>
                </select>
                <select
                  value={exerciseSearchFilters.equipment}
                  onChange={(e) => {
                    const newFilters = { ...exerciseSearchFilters, equipment: e.target.value };
                    setExerciseSearchFilters(newFilters);
                    searchExercises(exerciseSearchQuery, newFilters);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                >
                  <option value="">{lang === 'en' ? 'All Equipment' : 'Todo'}</option>
                  <option value="bodyweight">{lang === 'en' ? 'Bodyweight' : 'Peso Corporal'}</option>
                  <option value="dumbbell">{lang === 'en' ? 'Dumbbell' : 'Mancuerna'}</option>
                  <option value="barbell">{lang === 'en' ? 'Barbell' : 'Barra'}</option>
                  <option value="machine">{lang === 'en' ? 'Machine' : 'Máquina'}</option>
                </select>
                <select
                  value={exerciseSearchFilters.difficulty}
                  onChange={(e) => {
                    const newFilters = { ...exerciseSearchFilters, difficulty: e.target.value };
                    setExerciseSearchFilters(newFilters);
                    searchExercises(exerciseSearchQuery, newFilters);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                >
                  <option value="">{lang === 'en' ? 'All Levels' : 'Todos'}</option>
                  <option value="beginner">{lang === 'en' ? 'Beginner' : 'Principiante'}</option>
                  <option value="intermediate">{lang === 'en' ? 'Intermediate' : 'Intermedio'}</option>
                  <option value="advanced">{lang === 'en' ? 'Advanced' : 'Avanzado'}</option>
                </select>
              </div>

              {/* Exercise Results */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {loadingExercises ? (
                  <div className="text-center py-8 text-slate-400">
                    {lang === 'en' ? 'Loading exercises...' : 'Cargando ejercicios...'}
                  </div>
                ) : exerciseSearchResults.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    {lang === 'en' ? 'No exercises found. Try a different search.' : 'No se encontraron ejercicios. Intenta otra búsqueda.'}
                  </div>
                ) : (
                  exerciseSearchResults.map((exercise) => (
                    <div
                      key={exercise.id}
                      onClick={() => handleInsertExercise(exercise)}
                      className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-50">{exercise.name}</h4>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {exercise.category && (
                              <span className="text-xs text-slate-400">{exercise.category}</span>
                            )}
                            {exercise.equipment && (
                              <span className="text-xs text-slate-400">• {exercise.equipment}</span>
                            )}
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Button
                onClick={() => {
                  setShowInsertExercise(false);
                  setExerciseSearchQuery('');
                  setExerciseSearchResults([]);
                }}
                variant="outline"
                className="w-full border-slate-700 mt-4"
              >
                {lang === 'en' ? 'Close' : 'Cerrar'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

