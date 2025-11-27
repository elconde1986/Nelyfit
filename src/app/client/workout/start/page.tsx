import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { startWorkoutSession } from './actions';

export const dynamic = 'force-dynamic';

export default async function StartWorkoutPage({
  searchParams,
}: {
  searchParams: { workoutId?: string };
}) {
  const user = await requireAuth('CLIENT');
  
  if (!user || !user.clientId || !searchParams.workoutId) {
    redirect('/client/today');
  }

  const lang = getLang();

  // Create workout session
  const result = await startWorkoutSession({
    clientId: user.clientId,
    workoutId: searchParams.workoutId,
  });

  if (result.success && result.sessionId) {
    redirect(`/client/workout/${result.sessionId}`);
  } else {
    redirect('/client/today');
  }
}

