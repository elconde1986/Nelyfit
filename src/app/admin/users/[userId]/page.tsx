import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { LanguageToggle } from '@/components/LanguageToggle';
import UserDetailClient from './user-detail-client';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const targetUser = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          currentProgramId: true,
        },
      },
      profile: true,
      _count: {
        select: {
          coachedClients: true,
          programs: true,
          workouts: true,
          workoutSessions: true,
        },
      },
    },
  });

  if (!targetUser) {
    redirect('/admin/users');
  }

  // Serialize dates to strings for client component and convert null to undefined
  const serializedUser = {
    ...targetUser,
    createdAt: targetUser.createdAt.toISOString(),
    updatedAt: targetUser.updatedAt.toISOString(),
    lastLoginAt: targetUser.lastLoginAt?.toISOString() || null,
    lastPasswordChangeAt: targetUser.lastPasswordChangeAt?.toISOString() || null,
    trialStart: targetUser.trialStart?.toISOString() || null,
    trialEnd: targetUser.trialEnd?.toISOString() || null,
    client: targetUser.client || undefined,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <UserDetailClient user={serializedUser} lang={lang} />
      </div>
    </main>
  );
}

