import { requireAuth, getLang } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { prisma } from '@/lib/prisma';
import { MealPlanDetailClient } from './meal-plan-detail-client';

export const dynamic = 'force-dynamic';

export default async function MealPlanDetailPage({
  params,
}: {
  params: { planId: string };
}) {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  const mealPlan = await prisma.mealPlan.findUnique({
    where: { id: params.planId },
    include: {
      meals: {
        orderBy: [{ day: 'asc' }, { mealType: 'asc' }],
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!mealPlan) {
    notFound();
  }

  // Verify access
  if (mealPlan.userId !== user.id && mealPlan.assignedTo !== user.clientId && user.role !== 'ADMIN') {
    // Check if coach owns the client
    if (user.role === 'COACH' && mealPlan.assignedTo) {
      const client = await prisma.client.findUnique({
        where: { id: mealPlan.assignedTo },
        select: { coachId: true },
      });

      if (!client || client.coachId !== user.id) {
        redirect('/nutrition/meal-plans');
      }
    } else {
      redirect('/nutrition/meal-plans');
    }
  }

  // Get assigned client info if applicable
  let assignedClient = null;
  if (mealPlan.assignedTo) {
    assignedClient = await prisma.client.findUnique({
      where: { id: mealPlan.assignedTo },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <MealPlanDetailClient
          mealPlan={{
            ...mealPlan,
            startDate: mealPlan.startDate instanceof Date 
              ? mealPlan.startDate.toISOString() 
              : mealPlan.startDate,
            endDate: mealPlan.endDate 
              ? (mealPlan.endDate instanceof Date 
                  ? mealPlan.endDate.toISOString() 
                  : mealPlan.endDate)
              : null,
            createdAt: mealPlan.createdAt instanceof Date 
              ? mealPlan.createdAt.toISOString() 
              : mealPlan.createdAt,
          }}
          assignedClient={assignedClient && assignedClient.user ? {
            id: assignedClient.id,
            user: {
              id: assignedClient.user.id,
              name: assignedClient.user.name,
              email: assignedClient.user.email || null,
            },
          } : null}
          canEdit={user.role === 'COACH' && mealPlan.userId === user.id}
          lang={lang}
        />
      </div>
    </main>
  );
}

