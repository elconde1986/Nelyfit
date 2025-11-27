import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { MealPlanFormClient } from './meal-plan-form-client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CreateMealPlanPage() {
  const user = await requireAuth('COACH');
  if (!user) redirect('/login/coach');

  const lang = getLang();

  // Fetch coach's clients for assignment
  const clientsData = await prisma.client.findMany({
    where: { coachId: user.id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Transform to match expected type
  const clients = clientsData.map(client => ({
    id: client.id,
    user: client.user ? {
      id: client.user.id,
      name: client.user.name,
      email: client.user.email || null,
    } : null,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <MealPlanFormClient coachId={user.id} clients={clients} lang={lang} />
      </div>
    </main>
  );
}

