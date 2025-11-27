import { requireAuth, getLang } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import WorkoutDesignerEnhanced from '../../create/workout-designer-enhanced';

type WorkoutData = {
  name: string;
  description?: string;
  goal?: string;
  difficulty?: string;
  trainingEnvironment?: string;
  primaryBodyFocus?: string;
  estimatedDuration?: number;
  sessionTypes?: string[];
  tags?: string[];
  visibility?: string;
  sections?: Array<{
    id?: string;
    name: string;
    order: number;
    notes?: string;
    blocks?: Array<{
      id?: string;
      type: string;
      title?: string;
      instructions?: string;
      rounds?: number;
      restBetweenRounds?: number;
      estimatedTime?: number;
      order: number;
      exercises?: Array<{
        id?: string;
        exerciseId?: string;
        name: string;
        category?: string;
        equipment?: string;
        musclesTargeted?: string[];
        notes?: string;
        coachNotes?: string;
        targetRepsBySet?: number[];
        targetWeightBySet?: number[];
        targetRestBySet?: number[];
        targetRPEBySet?: number[];
        loadPrescriptionType?: string;
        order: number;
      }>;
    }>;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function EditWorkoutPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const user = await requireAuth('COACH');
  if (!user) redirect('/login/coach');

  const lang = getLang();

  // Fetch the workout with all its structure
  const workout = await prisma.workout.findUnique({
    where: { id: params.workoutId },
    include: {
      sections: {
        include: {
          blocks: {
            include: {
              exercises: {
                orderBy: { order: 'asc' },
                include: {
                  exercise: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  // Check permissions
  if (workout.coachId !== user.id && user.role !== 'ADMIN') {
    redirect('/coach/workouts');
  }

  const initialData: WorkoutData = {
    name: workout.name,
    description: workout.description || '',
    goal: workout.goal || undefined,
    difficulty: workout.difficulty || undefined,
    trainingEnvironment: workout.trainingEnvironment || undefined,
    primaryBodyFocus: workout.primaryBodyFocus || undefined,
    estimatedDuration: workout.estimatedDuration || undefined,
    sessionTypes: workout.sessionTypes || [],
    tags: workout.tags || [],
    visibility: workout.visibility || 'PRIVATE',
    sections: workout.sections.map((section) => ({
      id: section.id,
      name: section.name,
      order: section.order,
      notes: section.notes || '',
      blocks: section.blocks.map((block) => ({
        id: block.id,
        type: block.type,
        title: block.title || '',
        instructions: block.instructions || '',
        rounds: block.rounds || undefined,
        restBetweenRounds: block.restBetweenRounds || undefined,
        estimatedTime: block.estimatedTime || undefined,
        order: block.order,
        exercises: block.exercises.map((ex) => ({
          id: ex.id,
          exerciseId: ex.exerciseId || undefined,
          name: ex.name,
          category: ex.category || undefined,
          equipment: ex.equipment || undefined,
          musclesTargeted: ex.musclesTargeted || [],
          notes: ex.notes || undefined,
          coachNotes: ex.coachNotes || undefined,
          targetRepsBySet: Array.isArray(ex.targetRepsBySet)
            ? (ex.targetRepsBySet as number[])
            : typeof ex.targetRepsBySet === 'number'
            ? [ex.targetRepsBySet]
            : [8],
          targetWeightBySet: Array.isArray(ex.targetWeightBySet)
            ? (ex.targetWeightBySet as number[])
            : ex.targetWeightBySet
            ? [ex.targetWeightBySet as number]
            : undefined,
          targetRestBySet: Array.isArray(ex.targetRestBySet)
            ? (ex.targetRestBySet as number[])
            : ex.targetRestBySet
            ? [ex.targetRestBySet as number]
            : undefined,
          targetRPEBySet: Array.isArray(ex.targetRPEBySet)
            ? (ex.targetRPEBySet as number[])
            : undefined,
          loadPrescriptionType: ex.loadPrescriptionType || undefined,
          order: ex.order,
        })),
      })),
    })),
  };

  return (
    <WorkoutDesignerEnhanced
      coachId={user.id}
      workoutId={workout.id}
      initialData={initialData}
      lang={lang}
      mode="edit"
    />
  );
}

