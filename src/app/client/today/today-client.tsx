'use client';

import Link from 'next/link';
import { useTransition, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { 
  Dumbbell, 
  Flame, 
  Trophy, 
  Target, 
  CheckCircle2, 
  Circle, 
  ArrowLeft, 
  Map,
  Droplet,
  Footprints,
  Moon,
  Languages,
  Bell,
  Zap,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toggleWorkoutDone, toggleHabitDone } from './actions';

type Habit = { id: string; labelEn: string; labelEs: string };

type Props = {
  clientName: string;
  workout: any;
  habits: Habit[];
  log: any;
  initialGamification: {
    xp: number;
    level: number;
    streakDays: number;
    bestStreak: number;
  };
  initialLang: 'en' | 'es';
  notifications: { id: string; title: string; body: string }[];
  programDayTitle: string | null;
};

type Lang = 'en' | 'es';

const STRINGS = {
  en: {
    clientView: 'Client view',
    back: 'Back',
    todaysWorkout: "Today's workout",
    todaysHabits: "Today's habits",
    noWorkout: 'No workout scheduled today. Focus on habits and streaks.',
    levelLabel: 'Level',
    streak: (d: number) => `Streak: ${d} day${d === 1 ? '' : 's'}`,
    xpToNext: (rem: number) => `XP to next level: ${rem}`,
    badgeUnlocked: 'Badge unlocked!',
    programLesson: "Today's lesson:",
  },
  es: {
    clientView: 'Vista del cliente',
    back: 'Volver',
    todaysWorkout: 'Entrenamiento de hoy',
    todaysHabits: 'Hábitos de hoy',
    noWorkout: 'No tienes entrenamiento hoy. Enfócate en los hábitos y la racha.',
    levelLabel: 'Nivel',
    streak: (d: number) => `Racha: ${d} día${d === 1 ? '' : 's'}`,
    xpToNext: (rem: number) => `XP para el siguiente nivel: ${rem}`,
    badgeUnlocked: '¡Logro desbloqueado!',
    programLesson: 'Lección de hoy:',
  },
} as const;

const WORKOUT_PHRASES = {
  en: [
    'Boom! You just dropped a workout bomb. 🎯',
    'Muscles notified: growth in progress. 💪',
    'You vs. your excuses: 1–0 today. 🔥',
    'That’s one brick closer to your strongest self. 🧱',
    'Coach Nely just did a happy dance. 🕺',
  ],
  es: [
    '¡Boom! Acabas de reventar ese entrenamiento. 🎯',
    'Músculos notificados: crecimiento en progreso. 💪',
    'Tú vs. tus excusas: 1–0 hoy. 🔥',
    'Un ladrillo más hacia tu mejor versión. 🧱',
    'El coach Nely acaba de hacer un bailecito. 🕺',
  ],
};

const HABIT_PHRASES = {
  en: [
    'Tiny win, big momentum. Keep going. 🌱',
    'Hydration hero, habit slayer. 🚀',
    'Stacking habits like XP coins. 💰',
    'Healthy choices unlocked another level. 🎮',
    'You’re quietly becoming the person you promised yourself. ✨',
  ],
  es: [
    'Pequeña victoria, gran impulso. Sigue así. 🌱',
    'Héroe de la hidratación, destructor de malas costumbres. 🚀',
    'Apilando hábitos como monedas de XP. 💰',
    'Tus decisiones saludables acaban de subirte de nivel. 🎮',
    'Te estás convirtiendo en la persona que te prometiste ser. ✨',
  ],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function ClientTodayClient(props: Props) {
  const {
    clientName,
    workout,
    habits,
    log,
    initialGamification,
    initialLang,
    notifications,
    programDayTitle,
  } = props;

  const [lang, setLang] = useState<Lang>(initialLang || 'en');
  const t = STRINGS[lang];

  const [isPending, startTransition] = useTransition();
  const [gamification, setGamification] = useState(initialGamification);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [badgePopup, setBadgePopup] = useState<any[] | null>(null);

  const { width, height } = useWindowSize();

  function xpToNextLevel(level: number, xp: number) {
    const thresholds = [0, 100, 250, 450, 700, 1000];
    const idx = Math.min(level, thresholds.length - 1);
    const next = thresholds[idx] || xp + 100;
    return Math.max(0, next - xp);
  }

  const remainingXp = xpToNextLevel(gamification.level, gamification.xp);

  function handleGamificationResponse(
    res: any,
    type: 'workout' | 'habit',
  ) {
    if (!res) return;
    const {
      todayXp,
      totalXp,
      level,
      streakDays,
      bestStreak,
      leveledUp,
      badgeDetails,
    } = res;

    setGamification({
      xp: totalXp,
      level,
      streakDays,
      bestStreak,
    });

    if (todayXp > 0) {
      setFlashMessage(
        type === 'workout'
          ? randomFrom(WORKOUT_PHRASES[lang])
          : randomFrom(HABIT_PHRASES[lang]),
      );
      setTimeout(() => setFlashMessage(null), 2500);
    }

    if (leveledUp) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    if (badgeDetails && badgeDetails.length) {
      setBadgePopup(badgeDetails);
      setTimeout(() => setBadgePopup(null), 4000);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 relative overflow-hidden safe-top safe-bottom">
      {showConfetti && (
        <ReactConfetti width={width} height={height} numberOfPieces={200} recycle={false} />
      )}

      <div className="mx-auto max-w-md px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Language toggle */}
        <div className="flex justify-end mb-2">
          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/60 p-1">
            <button
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                lang === 'en'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setLang('en')}
            >
              <Languages className="w-3 h-3" />
              EN
            </button>
            <button
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                lang === 'es'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setLang('es')}
            >
              <Languages className="w-3 h-3" />
              ES
            </button>
          </div>
        </div>

        <header className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">{t.clientView}</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
              {lang === 'en'
                ? `Hi ${clientName.split(' ')[0]}, here's your day`
                : `Hola ${clientName.split(' ')[0]}, este es tu día`}
            </h1>
          </div>
          <Button asChild variant="secondary" size="sm" className="shrink-0">
            <Link href="/">
              <ArrowLeft className="w-3 h-3 mr-1" />
              {t.back}
            </Link>
          </Button>
        </header>

        {/* Notifications */}
        {notifications && notifications.length > 0 && (
          <section className="space-y-2 animate-slide-in">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-emerald-500/60 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-50 shadow-lg shadow-emerald-500/10 flex items-start gap-3"
              >
                <Bell className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold mb-1">{n.title}</p>
                  <p className="text-emerald-100/90">{n.body}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Gamification header */}
        <Card className="relative overflow-hidden border-emerald-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 opacity-50" />
          <CardContent className="relative space-y-3 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{t.levelLabel}</p>
                </div>
                <p className="text-3xl sm:text-4xl font-bold gradient-text">Lv. {gamification.level}</p>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-1.5 justify-end">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <p className="text-xs sm:text-sm font-semibold text-slate-200">
                    {gamification.streakDays}
                  </p>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <p className="text-xs text-slate-400">
                    {t.xpToNext(remainingXp)}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out shadow-lg shadow-emerald-500/30"
                style={{ width: `${Math.min(100, (gamification.xp % 100))}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {badgePopup && (
          <section className="rounded-xl border border-yellow-400/60 bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 px-4 py-3 text-xs sm:text-sm text-yellow-50 space-y-2 shadow-lg shadow-yellow-500/20 animate-fade-in">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-300" />
              <p className="font-bold text-yellow-100">{t.badgeUnlocked}</p>
            </div>
            {badgePopup.map((b) => (
              <div key={b.id} className="space-y-1">
                <p className="font-semibold text-yellow-100">
                  {lang === 'en' ? b.nameEn : b.nameEs}
                </p>
                <p className="text-yellow-200/90">
                  {lang === 'en' ? b.descriptionEn : b.descriptionEs}
                </p>
              </div>
            ))}
          </section>
        )}

        {flashMessage && (
          <section className="rounded-xl border border-emerald-400/60 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-50 shadow-lg shadow-emerald-500/20 animate-fade-in">
            {flashMessage}
          </section>
        )}

        {/* Program lesson title */}
        {programDayTitle && (
          <p className="text-xs text-slate-400">
            {t.programLesson} {programDayTitle}
          </p>
        )}

        {/* Workout */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-bold">{t.todaysWorkout}</h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/client/program-map">
                <Map className="w-3 h-3 mr-1" />
                {lang === 'en' ? 'Map' : 'Mapa'}
              </Link>
            </Button>
          </div>
          <Card className="space-y-3">
            {!workout ? (
              <p className="text-slate-300 text-sm sm:text-base py-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-500" />
                {t.noWorkout}
              </p>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="w-5 h-5 text-emerald-400" />
                    <p className="font-bold text-base sm:text-lg">{workout.name}</p>
                  </div>
                  {workout.description && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed ml-7">
                      {workout.description}
                    </p>
                  )}
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300 ml-2">
                  {workout.exercises?.map((ex: any) => (
                    <li key={ex.id} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="flex-1">{ex.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {ex.sets}x{ex.reps ?? '?'}
                      </Badge>
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await toggleWorkoutDone();
                      handleGamificationResponse(res, 'workout');
                    })
                  }
                  className="w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {lang === 'en' ? 'Mark workout done' : 'Marcar entrenamiento hecho'}
                </Button>
              </>
            )}
          </Card>
        </section>

        {/* Habits */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-bold">{t.todaysHabits}</h2>
          </div>
          <div className="space-y-2.5">
            {habits.map((h) => {
              const done = log?.habitsCompleted?.includes(h.id);
              const iconMap: Record<string, any> = {
                water: Droplet,
                steps: Footprints,
                sleep: Moon,
              };
              const Icon = iconMap[h.id] || Circle;
              
              return (
                <button
                  key={h.id}
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await toggleHabitDone(h.id);
                      handleGamificationResponse(res, 'habit');
                    })
                  }
                  className={`w-full text-left rounded-xl border px-4 py-3.5 text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                    done
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-50 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-900/80 active:scale-[0.98]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {done ? (
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${done ? 'text-emerald-400' : 'text-slate-500'}`} />
                  ) : (
                    <Icon className="w-5 h-5 shrink-0 text-slate-500" />
                  )}
                  <span className="flex-1">{lang === 'en' ? h.labelEn : h.labelEs}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
