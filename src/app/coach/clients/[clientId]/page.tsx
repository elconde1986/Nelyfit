import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import ClientDetailsClient from './client-details-client';

export const dynamic = 'force-dynamic';

export default async function ClientDetailsPage({
  params,
}: {
  params: { clientId: string };
}) {
  const coach = await requireAuth('COACH');
  if (!coach) redirect('/login/coach');

  const lang = getLang();

  const client = await prisma.client.findUnique({
    where: { id: params.clientId },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      coach: true,
      currentProgram: {
        include: {
          days: {
            include: {
              workout: {
                include: {
                  exercises: true,
                },
              },
            },
            orderBy: { dayIndex: 'asc' },
          },
          weeks: {
            orderBy: { weekNumber: 'asc' },
          },
        },
      },
      gamification: true,
      logs: {
        orderBy: { date: 'desc' },
        take: 14,
      },
      messages: {
        where: { coachId: coach.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      notes: {
        where: { coachId: coach.id },
        orderBy: { createdAt: 'desc' },
      },
      notifications: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!client) {
    notFound();
  }

  // Verify coach owns this client
  if (client.coachId !== coach.id) {
    redirect('/coach/dashboard');
  }

  // Get workout logs for analytics
  const workoutLogs = await prisma.workoutLog.findMany({
    where: { userId: client.userId || '' },
    orderBy: { date: 'desc' },
    take: 30,
    include: {
      workout: true,
      exerciseLogs: true,
    },
  });

  // Get body measurements
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId: client.userId || '' },
    orderBy: { date: 'desc' },
    take: 30,
  });

  return (
    <ClientDetailsClient
      client={client}
      workoutLogs={workoutLogs}
      measurements={measurements}
      coachId={coach.id}
      lang={lang}
    />
  );
}

