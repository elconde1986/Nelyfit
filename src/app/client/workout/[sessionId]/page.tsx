import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import WorkoutExecutionEnhanced from './workout-execution-enhanced';

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

  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    select: { coachId: true },
  });

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
                    include: {
                      exercise: {
                        include: {
                          coachVideos: client?.coachId
                            ? {
                                where: {
                                  coachId: client.coachId,
                                  status: 'ACTIVE',
                                },
                                orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
                                take: 1,
                              }
                            : false,
                        },
                      },
                    },
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

  // WorkoutSession.clientId references User.id, not Client.id
  if (!session || session.clientId !== user.id) {
    notFound();
  }

  return (
    <WorkoutExecutionEnhanced
      session={session}
      clientId={user.clientId}
      lang={lang}
    />
  );
}

