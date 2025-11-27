import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { Utensils } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminMealPlansPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const mealPlans = await prisma.mealPlan.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { meals: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const stats = {
    total: mealPlans.length,
    active: mealPlans.filter(p => {
      const now = new Date();
      return p.startDate <= now && (!p.endDate || p.endDate >= now);
    }).length,
    totalMeals: mealPlans.reduce((sum, p) => sum + p._count.meals, 0),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Meal Plan Management' : 'Gestión de Planes de Comida'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'View all meal plans across the platform'
              : 'Ver todos los planes de comida en la plataforma'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Plans' : 'Planes Totales'}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Active' : 'Activos'}</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Meals' : 'Comidas Totales'}</p>
              <p className="text-2xl font-bold text-purple-400">{stats.totalMeals}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'All Meal Plans' : 'Todos los Planes de Comida'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mealPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Utensils className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-sm text-slate-400">{plan.user.name || plan.user.email}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{plan.calories} {lang === 'en' ? 'calories' : 'calorías'}</span>
                        <span>•</span>
                        <span>{plan._count.meals} {lang === 'en' ? 'meals' : 'comidas'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {mealPlans.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No meal plans found' : 'No se encontraron planes de comida'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

