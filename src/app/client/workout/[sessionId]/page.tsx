import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import WorkoutExecutionNew from './workout-execution-new';

export const dynamic = 'force-dynamic';

export default async function WorkoutExecutionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const user = await requireAuth('CLIENT');
  
  if (!user || !user.clientId) {
    redirect('/login/client');
  }

  const lang = getLang();

  // Verify session exists and belongs to user
  const { prisma } = await import('@/lib/prisma');
  const session = await prisma.workoutSession.findUnique({
    where: { id: params.sessionId },
    select: { id: true, clientId: true },
  });

  // WorkoutSession.clientId references User.id, not Client.id
  if (!session || session.clientId !== user.id) {
    notFound();
  }

  return (
    <WorkoutExecutionNew
      sessionId={params.sessionId}
      initialLang={lang}
    />
  );
}

