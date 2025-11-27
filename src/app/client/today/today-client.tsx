'use client';

import Link from 'next/link';
import { useTransition, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';
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
    <main className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      {showConfetti && (
        <ReactConfetti width={width} height={height} numberOfPieces={200} recycle={false} />
      )}

      <div className="mx-auto max-w-md px-4 py-6 space-y-6">
        {/* Language toggle */}
        <div className="flex justify-end mb-2">
          <button
            className={`text-xs px-2 py-1 rounded-l-lg border border-slate-700 ${
              lang === 'en' ? 'bg-slate-800' : ''
            }`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={`text-xs px-2 py-1 rounded-r-lg border border-slate-700 border-l-0 ${
              lang === 'es' ? 'bg-slate-800' : ''
            }`}
            onClick={() => setLang('es')}
          >
            ES
          </button>
        </div>

        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase mb-1">{t.clientView}</p>
            <h1 className="text-xl font-semibold tracking-tight">
              {lang === 'en'
                ? `Hi ${clientName.split(' ')[0]}, here’s your day`
                : `Hola ${clientName.split(' ')[0]}, este es tu día`}
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs border border-slate-700 rounded-lg px-3 py-1 hover:border-emerald-400"
          >
            {t.back}
          </Link>
        </header>

        {/* Notifications */}
        {notifications && notifications.length > 0 && (
          <section className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-50"
              >
                <p className="font-semibold">{n.title}</p>
                <p>{n.body}</p>
              </div>
            ))}
          </section>
        )}

        {/* Gamification header */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase mb-1">{t.levelLabel}</p>
              <p className="text-2xl font-semibold">Lv. {gamification.level}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">
                {t.streak(gamification.streakDays)}
              </p>
              <p className="text-xs text-slate-400">
                {t.xpToNext(remainingXp)}
              </p>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${Math.min(100, (gamification.xp % 100))}%` }}
            />
          </div>
        </section>

        {badgePopup && (
          <section className="rounded-xl border border-yellow-400/60 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-100 space-y-1">
            <p className="font-semibold">{t.badgeUnlocked}</p>
            {badgePopup.map((b) => (
              <p key={b.id}>
                {lang === 'en' ? b.nameEn : b.nameEs} –{' '}
                {lang === 'en' ? b.descriptionEn : b.descriptionEs}
              </p>
            ))}
          </section>
        )}

        {flashMessage && (
          <section className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
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
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{t.todaysWorkout}</h2>
            <Link
              href="/client/program-map"
              className="text-[11px] text-emerald-400 hover:underline"
            >
              {lang === 'en' ? 'Program map' : 'Mapa del programa'}
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
            {!workout ? (
              <p className="text-slate-300">{t.noWorkout}</p>
            ) : (
              <>
                <p className="font-medium">{workout.name}</p>
                {workout.description && (
                  <p className="text-xs text-slate-300 mt-1">
                    {workout.description}
                  </p>
                )}
                <ul className="mt-2 space-y-1 text-xs text-slate-300">
                  {workout.exercises?.map((ex: any) => (
                    <li key={ex.id}>
                      • {ex.name} – {ex.sets}x{ex.reps ?? '?'}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await toggleWorkoutDone();
                      handleGamificationResponse(res, 'workout');
                    })
                  }
                  className="mt-3 inline-flex items-center rounded-lg bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-medium hover:bg-emerald-400 disabled:opacity-60"
                >
                  {lang === 'en' ? 'Mark workout done' : 'Marcar entrenamiento hecho'}
                </button>
              </>
            )}
          </div>
        </section>

        {/* Habits */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">{t.todaysHabits}</h2>
          <div className="space-y-2">
            {habits.map((h) => {
              const done = log?.habitsCompleted?.includes(h.id);
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
                  className={`w-full text-left rounded-2xl border px-4 py-2 text-xs ${
                    done
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-50'
                      : 'border-slate-800 bg-slate-900/60 text-slate-200'
                  }`}
                >
                  {lang === 'en' ? h.labelEn : h.labelEs}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
