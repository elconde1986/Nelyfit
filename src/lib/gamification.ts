import { prisma } from './prisma';
import { BADGE_DEFS } from './badges';
import type { BadgeId } from './types';

const WORKOUT_XP = 30;
const HABIT_XP = 5;
const DAILY_HABIT_BONUS = 10;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(today: Date, other: Date) {
  const y = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  return isSameDay(y, other);
}

function levelFromXp(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 450) return 3;
  if (xp < 700) return 4;
  if (xp < 1000) return 5;
  return Math.floor(5 + (xp - 1000) / 300);
}

export async function ensureGamificationProfile(clientId: string) {
  let profile = await prisma.gamificationProfile.findUnique({
    where: { clientId },
  });
  if (!profile) {
    profile = await prisma.gamificationProfile.create({
      data: { clientId },
    });
  }
  return profile;
}

export async function updateGamificationForToday(clientId: string) {
  const today = startOfDay(new Date());

  const log = await prisma.completionLog.findFirst({
    where: {
      clientId,
      date: {
        gte: today,
        lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      },
    },
  });

  const profile = await ensureGamificationProfile(clientId);

  let todayXp = 0;
  let totalWorkoutsDelta = 0;
  let totalHabitsDelta = 0;

  if (log) {
    if (log.workoutCompleted) {
      todayXp += WORKOUT_XP;
      totalWorkoutsDelta = 1;
    }
    const habitCount = log.habitsCompleted.length;
    if (habitCount > 0) {
      todayXp += habitCount * HABIT_XP;
      totalHabitsDelta = habitCount;
      if (habitCount >= 3) {
        todayXp += DAILY_HABIT_BONUS;
      }
    }
  }

  const hadActivityToday = todayXp > 0;
  const now = today;

  let newStreak = profile.streakDays;
  if (hadActivityToday) {
    if (!profile.lastActiveDate) {
      newStreak = 1;
    } else if (isSameDay(now, profile.lastActiveDate)) {
      // same day
    } else if (isYesterday(now, profile.lastActiveDate)) {
      newStreak = profile.streakDays + 1;
    } else {
      newStreak = 1;
    }
  }

  const prevXp = profile.xp;
  const newXp = profile.xp + todayXp;
  const oldLevel = profile.level;
  const newLevel = levelFromXp(newXp);
  const leveledUp = newLevel > oldLevel;

  const updated = await prisma.gamificationProfile.update({
    where: { id: profile.id },
    data: {
      xp: newXp,
      level: newLevel,
      streakDays: hadActivityToday ? newStreak : profile.streakDays,
      bestStreak: Math.max(profile.bestStreak, newStreak),
      lastActiveDate: hadActivityToday ? now : profile.lastActiveDate,
      totalWorkouts: profile.totalWorkouts + totalWorkoutsDelta,
      totalHabits: profile.totalHabits + totalHabitsDelta,
    },
  });

  const newBadges: BadgeId[] = [];
  const already = new Set(updated.badges as BadgeId[]);

  if (updated.streakDays >= 7 && !already.has('STREAK_7')) newBadges.push('STREAK_7');
  if (updated.totalWorkouts >= 10 && !already.has('WORKOUTS_10'))
    newBadges.push('WORKOUTS_10');
  if (updated.totalHabits >= 100 && !already.has('HABITS_100'))
    newBadges.push('HABITS_100');

  let finalProfile = updated;
  if (newBadges.length) {
    finalProfile = await prisma.gamificationProfile.update({
      where: { id: updated.id },
      data: {
        badges: { set: [...already, ...newBadges] },
      },
    });
  }

  return {
    todayXp,
    totalXp: finalProfile.xp,
    level: finalProfile.level,
    streakDays: finalProfile.streakDays,
    bestStreak: finalProfile.bestStreak,
    leveledUp,
    newBadges,
    badgeDetails: newBadges.map((id) => BADGE_DEFS[id]),
  };
}
