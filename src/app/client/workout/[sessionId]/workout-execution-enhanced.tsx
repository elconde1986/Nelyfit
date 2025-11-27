'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  SkipForward,
  AlertTriangle,
  Trophy,
  Zap,
  Award,
  X,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';
import { logSet, completeSession } from './actions';

const FEELING_EMOJIS = [
  { code: 'TOO_EASY', emoji: '😄', labelEn: 'Too Easy', labelEs: 'Demasiado Fácil' },
  { code: 'GOOD_CHALLENGE', emoji: '🙂', labelEn: 'Good Challenge', labelEs: 'Buen Desafío' },
  { code: 'HARD', emoji: '😓', labelEn: 'Hard', labelEs: 'Difícil' },
  { code: 'FAILED_REPS', emoji: '😵', labelEn: 'Failed Reps', labelEs: 'No Completé' },
  { code: 'PAIN', emoji: '😣', labelEn: 'Pain / Wrong', labelEs: 'Dolor / Mal' },
];

type ExerciseState = {
  currentSet: number;
  completed: boolean;
};

export default function WorkoutExecutionEnhanced({
  session,
  clientId,
  lang,
}: {
  session: any;
  clientId: string;
  lang: Lang;
}) {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const t = translations.client[lang] || translations.client.en;
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseStates, setExerciseStates] = useState<{ [key: string]: ExerciseState }>({});
  const [setLogs, setSetLogs] = useState<{ [key: string]: any }>({});
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [badgesUnlocked, setBadgesUnlocked] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPainPrompt, setShowPainPrompt] = useState<string | null>(null);
  const [painNote, setPainNote] = useState('');

  const sections = session.workout.sections || [];
  const currentSection = sections[currentSectionIndex];
  const currentBlock = currentSection?.blocks?.[currentBlockIndex];
  const currentWorkoutExercise = currentBlock?.exercises?.[currentExerciseIndex];
  const currentExercise = currentWorkoutExercise?.exercise || currentWorkoutExercise;

  // Calculate progress
  const totalExercises = sections.reduce(
    (sum: number, s: any) => sum + s.blocks.reduce((bSum: number, b: any) => bSum + b.exercises.length, 0),
    0
  );
  const completedExercises = Object.values(exerciseStates).filter((s) => s.completed).length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const updateSetLog = async (
    workoutExerciseId: string,
    setNumber: number,
    field: string,
    value: any
  ) => {
    const key = `${workoutExerciseId}-${setNumber}`;
    setSetLogs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));

    try {
      await logSet({
        sessionId: session.id,
        workoutExerciseId: workoutExerciseId,
        setNumber,
        [field]: value,
      } as any);
    } catch (error) {
      console.error('Error saving set log:', error);
    }
  };

  const handleFeelingClick = async (
    workoutExerciseId: string,
    setNumber: number,
    feeling: typeof FEELING_EMOJIS[0]
  ) => {
    if (feeling.code === 'PAIN') {
      setShowPainPrompt(`${workoutExerciseId}-${setNumber}`);
      return;
    }

    await updateSetLog(workoutExerciseId, setNumber, 'feelingCode', feeling.code);
    await updateSetLog(workoutExerciseId, setNumber, 'feelingEmoji', feeling.emoji);
  };

  const handlePainConfirm = async (workoutExerciseId: string, setNumber: number) => {
    await updateSetLog(workoutExerciseId, setNumber, 'feelingCode', 'PAIN');
    await updateSetLog(workoutExerciseId, setNumber, 'feelingEmoji', '😣');
    if (painNote) {
      await updateSetLog(workoutExerciseId, setNumber, 'feelingNote', painNote);
    }
    setShowPainPrompt(null);
    setPainNote('');
  };

  const isSetComplete = (workoutExerciseId: string, setNumber: number) => {
    const log = setLogs[`${workoutExerciseId}-${setNumber}`] || {};
    return log.actualReps && log.actualWeight !== undefined && log.feelingCode;
  };

  const isExerciseComplete = (workoutExercise: any) => {
    const targetReps = (workoutExercise.targetRepsBySet as number[]) || [];
    return targetReps.every((_, idx) => isSetComplete(workoutExercise.id, idx + 1));
  };

  const handleNextExercise = () => {
    if (!currentWorkoutExercise || !currentBlock || !currentSection) return;

    // Mark current exercise as completed
    setExerciseStates((prev) => ({
      ...prev,
      [currentWorkoutExercise.id]: { currentSet: 0, completed: true },
    }));

    // Move to next exercise
    if (currentExerciseIndex < currentBlock.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else if (currentBlockIndex < currentSection.blocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
      setCurrentExerciseIndex(0);
    } else if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentBlockIndex(0);
      setCurrentExerciseIndex(0);
    } else {
      // All exercises complete - show completion screen
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const result = await completeSession(session.id);
      
      // Calculate XP (simplified - in real app, this would come from server)
      const baseXP = 50;
      const bonusXP = completedExercises * 5;
      const totalXP = baseXP + bonusXP;
      
      setXpGained(totalXP);
      setShowCompletion(true);
      
      // After 3 seconds, redirect
      setTimeout(() => {
        router.push('/client/today');
      }, 3000);
    } catch (error) {
      console.error('Error completing session:', error);
      alert(lang === 'en' ? 'Error completing workout' : 'Error al completar entrenamiento');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showCompletion) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center">
        <ReactConfetti width={width} height={height} recycle={false} />
        <Card className="max-w-md w-full mx-4 text-center">
          <CardHeader>
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl">
              {lang === 'en' ? 'Workout Complete!' : '¡Entrenamiento Completado!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <p className="text-2xl font-bold text-yellow-400">+{xpGained} XP</p>
              </div>
              <p className="text-slate-400">
                {lang === 'en'
                  ? 'Great job completing your workout!'
                  : '¡Excelente trabajo completando tu entrenamiento!'}
              </p>
            </div>
            {badgesUnlocked.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold">
                  {lang === 'en' ? 'Badges Unlocked!' : '¡Insignias Desbloqueadas!'}
                </p>
                {badgesUnlocked.map((badge) => (
                  <Badge key={badge.id} variant="default" className="mr-2">
                    <Award className="w-3 h-3 mr-1" />
                    {lang === 'en' ? badge.nameEn : badge.nameEs}
                  </Badge>
                ))}
              </div>
            )}
            <Button asChild className="w-full">
              <Link href="/client/today">
                {lang === 'en' ? 'Back to Today' : 'Volver a Hoy'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const targetReps = (currentWorkoutExercise.targetRepsBySet as number[]) || [];
  const targetWeights = (currentWorkoutExercise.targetWeightBySet as (number | null)[]) || [];
  const currentSet = exerciseStates[currentWorkoutExercise.id]?.currentSet || 1;
  const exerciseCompleted = isExerciseComplete(currentWorkoutExercise);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">
              {lang === 'en' ? 'Exercise' : 'Ejercicio'} {completedExercises + 1} / {totalExercises}
            </span>
            <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Section Header */}
        {currentSection && (
          <div className="mb-6 text-center">
            <Badge variant="secondary" className="mb-2">
              {currentSection.name}
            </Badge>
            {currentSection.notes && (
              <p className="text-sm text-slate-400">{currentSection.notes}</p>
            )}
          </div>
        )}

        {/* Current Exercise Card */}
        <Card className="mb-6">
            <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{currentWorkoutExercise.name}</CardTitle>
                {currentWorkoutExercise.notes && (
                  <CardDescription>{currentWorkoutExercise.notes}</CardDescription>
                )}
              </div>
              {/* Video Thumbnail */}
              {(() => {
                const exercise = currentExercise;
                const coachVideo = exercise?.coachVideos?.[0];
                const defaultVideo = exercise?.defaultVideoUrl;
                const videoUrl = coachVideo?.videoUrl || defaultVideo;
                
                if (videoUrl) {
                  const extractYouTubeId = (url: string) => {
                    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                    return match ? match[1] : null;
                  };
                  
                  const videoId = extractYouTubeId(videoUrl);
                  const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
                  
                  return (
                    <div className="ml-4 relative">
                      {thumbnail ? (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-32 h-20 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 hover:border-emerald-500 transition-colors relative"
                        >
                          <img
                            src={thumbnail}
                            alt={lang === 'en' ? 'Technique video' : 'Video de técnica'}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </a>
                      ) : (
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-emerald-500 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-xs">
                            {lang === 'en' ? 'Watch Video' : 'Ver Video'}
                          </span>
                        </a>
                      )}
                      {coachVideo && (
                        <p className="text-xs text-slate-400 mt-1 text-center">
                          {lang === 'en' ? 'Coach Video' : 'Video del Entrenador'}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timer (for time-based exercises) */}
            {currentExercise.durationSeconds && (
              <div className="flex items-center justify-center gap-4 p-4 bg-slate-900/60 rounded-lg">
                <Clock className="w-6 h-6 text-emerald-400" />
                <div className="text-3xl font-bold">{formatTime(timerSeconds)}</div>
                <div className="flex gap-2">
                  {!timerActive ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setTimerActive(true)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setTimerActive(false)}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTimerSeconds(0);
                      setTimerActive(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Sets */}
            <div className="space-y-3">
              {targetReps.map((targetRep, setIdx) => {
                const setNumber = setIdx + 1;
                const targetWeight = targetWeights[setIdx];
                                const log = setLogs[`${currentWorkoutExercise.id}-${setNumber}`] || {};
                                const completed = isSetComplete(currentWorkoutExercise.id, setNumber);

                return (
                  <div
                    key={setIdx}
                    className={`p-4 rounded-lg border-2 ${
                      completed
                        ? 'bg-emerald-500/10 border-emerald-500/50'
                        : setNumber === currentSet
                        ? 'bg-blue-500/10 border-blue-500/50'
                        : 'bg-slate-900/60 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">Set {setNumber}</span>
                        <span className="text-slate-400">
                          {targetRep} reps {targetWeight ? `@ ${targetWeight}kg` : ''}
                        </span>
                      </div>
                      {completed && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          {lang === 'en' ? 'Weight (kg)' : 'Peso (kg)'}
                        </label>
                        <input
                          type="number"
                          value={log.actualWeight || ''}
                              onChange={(e) =>
                            updateSetLog(
                              currentWorkoutExercise.id,
                              setNumber,
                              'actualWeight',
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                          placeholder={targetWeight?.toString() || '0'}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          {lang === 'en' ? 'Reps' : 'Repeticiones'}
                        </label>
                        <input
                          type="number"
                          value={log.actualReps || ''}
                          onChange={(e) =>
                            updateSetLog(
                              currentWorkoutExercise.id,
                              setNumber,
                              'actualReps',
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          placeholder={targetRep.toString()}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-2 block">
                        {lang === 'en' ? 'How did it feel?' : '¿Cómo se sintió?'}
                      </label>
                      <div className="flex gap-2">
                        {FEELING_EMOJIS.map((feeling) => (
                          <button
                            key={feeling.code}
                            onClick={() => handleFeelingClick(currentWorkoutExercise.id, setNumber, feeling)}
                            className={`text-2xl p-2 rounded-lg transition-all ${
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
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              if (currentExerciseIndex > 0) {
                setCurrentExerciseIndex(currentExerciseIndex - 1);
              } else if (currentBlockIndex > 0) {
                setCurrentBlockIndex(currentBlockIndex - 1);
                const prevBlock = currentSection.blocks[currentBlockIndex - 1];
                setCurrentExerciseIndex(prevBlock.exercises.length - 1);
              } else if (currentSectionIndex > 0) {
                setCurrentSectionIndex(currentSectionIndex - 1);
                const prevSection = sections[currentSectionIndex - 1];
                const lastBlock = prevSection.blocks[prevSection.blocks.length - 1];
                setCurrentBlockIndex(prevSection.blocks.length - 1);
                setCurrentExerciseIndex(lastBlock.exercises.length - 1);
              }
            }}
            disabled={currentSectionIndex === 0 && currentBlockIndex === 0 && currentExerciseIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Previous' : 'Anterior'}
          </Button>
          <Button
            onClick={handleNextExercise}
            disabled={!exerciseCompleted}
            className="flex-1"
          >
            {exerciseCompleted ? (
              <>
                {lang === 'en' ? 'Next Exercise' : 'Siguiente Ejercicio'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                {lang === 'en' ? 'Complete All Sets' : 'Completa Todas las Series'}
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleNextExercise()}
          >
            <SkipForward className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Skip' : 'Saltar'}
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
                      const [workoutExerciseId, setNumber] = showPainPrompt.split('-');
                      handlePainConfirm(workoutExerciseId, parseInt(setNumber));
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

