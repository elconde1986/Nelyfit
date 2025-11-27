import type { BadgeId } from './types';

export type BadgeDef = {
  id: BadgeId;
  nameEn: string;
  nameEs: string;
  descriptionEn: string;
  descriptionEs: string;
  icon: string;
};

export const BADGE_DEFS: Record<BadgeId, BadgeDef> = {
  STREAK_7: {
    id: 'STREAK_7',
    nameEn: '7-Day Hot Streak',
    nameEs: 'Racha de 7 Días 🔥',
    descriptionEn: 'Completed activity 7 days in a row.',
    descriptionEs: 'Completaste actividad 7 días seguidos.',
    icon: '🔥',
  },
  WORKOUTS_10: {
    id: 'WORKOUTS_10',
    nameEn: '10 Workouts Done',
    nameEs: '10 Entrenamientos Completados',
    descriptionEn: 'Crushed your first 10 workouts.',
    descriptionEs: 'Completaste tus primeros 10 entrenamientos.',
    icon: '🏋️‍♀️',
  },
  HABITS_100: {
    id: 'HABITS_100',
    nameEn: '100 Healthy Choices',
    nameEs: '100 Hábitos Saludables',
    descriptionEn: 'Logged 100 habits. Tiny wins, huge impact.',
    descriptionEs: 'Registraste 100 hábitos. Pequeñas acciones, gran impacto.',
    icon: '🌿',
  },
};
