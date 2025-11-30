import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import ClientsClient from './clients-client';

export const dynamic = 'force-dynamic';

export default async function CoachClientsPage() {
  const coach = await requireAuth('COACH');
  if (!coach) redirect('/login/coach');

  const lang = getLang();

  // Get coach's assigned clients
  const assignedClients = await prisma.client.findMany({
    where: {
      coachId: coach.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      gamification: true,
      currentProgram: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      user: {
        name: 'asc',
      },
    },
  });

  // Get unassigned clients (clients without a coach)
  const unassignedClients = await prisma.client.findMany({
    where: {
      coachId: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      user: {
        name: 'asc',
      },
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <ClientsClient
          assignedClients={assignedClients}
          unassignedClients={unassignedClients}
          coachId={coach.id}
          lang={lang}
        />
      </div>
    </main>
  );
}

