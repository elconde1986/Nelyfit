import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import WorkoutExecutionClient from './workout-execution-client';

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

  const session = await prisma.workoutSession.findUnique({
    where: { id: params.sessionId },
    include: {
      workout: {
        include: {
          sections: {
            include: {
              blocks: {
                include: {
                  exercises: {
                    orderBy: { order: 'asc' },
                  },
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      },
      setLogs: {
        orderBy: { setNumber: 'asc' },
      },
    },
  });

  if (!session || session.clientId !== user.clientId) {
    notFound();
  }

  return (
    <WorkoutExecutionClient
      session={session}
      clientId={user.clientId}
      lang={lang}
    />
  );
}

