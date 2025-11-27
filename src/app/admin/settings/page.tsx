import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SystemSettingsClient from './system-settings-client';

export const dynamic = 'force-dynamic';

export default async function SystemSettingsPage() {
  const user = await requireAuth('ADMIN');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();

  // Get system stats
  const stats = {
    totalUsers: await prisma.user.count(),
    totalCoaches: await prisma.user.count({ where: { role: 'COACH' } }),
    totalClients: await prisma.client.count(),
    totalWorkouts: await prisma.workout.count(),
    totalPrograms: await prisma.program.count(),
  };

  return (
    <SystemSettingsClient
      stats={stats}
      lang={lang}
    />
  );
}

