import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Utensils, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MealPlansPage() {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  const mealPlans = await prisma.mealPlan.findMany({
    where: { userId: user.id },
    include: {
      meals: {
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: { meals: true },
      },
    },
    orderBy: { startDate: 'desc' },
    take: 20,
  });

  const currentPlan = mealPlans.find(plan => {
    const now = new Date();
    return plan.startDate <= now && (!plan.endDate || plan.endDate >= now);
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">
                {lang === 'en' ? 'Meal Plans' : 'Planes de Comida'}
              </span>
            </h1>
            {user.role === 'COACH' && (
              <Button asChild className="mt-4">
                <Link href="/nutrition/meal-plans/create">
                  <Plus className="w-4 h-4 mr-2" />
                  {lang === 'en' ? 'Create Meal Plan' : 'Crear Plan de Comida'}
                </Link>
              </Button>
            )}
            <p className="text-slate-400 text-sm mt-1">
              {lang === 'en'
                ? 'View and manage your nutrition plans'
                : 'Ver y gestiona tus planes de nutrición'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" asChild>
              <a href="/nutrition/macro-calculator">
                {lang === 'en' ? 'Macro Calculator' : 'Calculadora de Macros'}
              </a>
            </Button>
            <Button variant="secondary" asChild>
              <a href="/nutrition/grocery-lists">
                {lang === 'en' ? 'Grocery List' : 'Lista de Compras'}
              </a>
            </Button>
          </div>
        </header>

        {currentPlan && (
          <Card className="mb-6 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-emerald-400" />
                  {lang === 'en' ? 'Current Meal Plan' : 'Plan de Comida Actual'}
                </CardTitle>
                <Badge variant="success">{lang === 'en' ? 'Active' : 'Activo'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-400">{lang === 'en' ? 'Calories' : 'Calorías'}</p>
                  <p className="text-2xl font-bold">{currentPlan.calories}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">{lang === 'en' ? 'Protein' : 'Proteína'}</p>
                  <p className="text-2xl font-bold">{currentPlan.protein}g</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">{lang === 'en' ? 'Carbs' : 'Carbohidratos'}</p>
                  <p className="text-2xl font-bold">{currentPlan.carbs}g</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">{lang === 'en' ? 'Fats' : 'Grasas'}</p>
                  <p className="text-2xl font-bold">{currentPlan.fats}g</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                {currentPlan._count.meals} {lang === 'en' ? 'meals' : 'comidas'} • {currentPlan.name}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'All Meal Plans' : 'Todos los Planes de Comida'}</CardTitle>
          </CardHeader>
          <CardContent>
            {mealPlans.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">
                  {lang === 'en'
                    ? 'No meal plans assigned yet'
                    : 'Aún no se han asignado planes de comida'}
                </p>
              </div>
            ) : (
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
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                          <span>{plan.calories} {lang === 'en' ? 'calories' : 'calorías'}</span>
                          <span>•</span>
                          <span>{plan._count.meals} {lang === 'en' ? 'meals' : 'comidas'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(plan.startDate).toLocaleDateString()}
                            {plan.endDate && ` - ${new Date(plan.endDate).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" asChild>
                        <a href={`/nutrition/meal-plans/${plan.id}`}>
                          {lang === 'en' ? 'View Details' : 'Ver Detalles'}
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/nutrition/macro-calculator">
                          {lang === 'en' ? 'Calculate Macros' : 'Calcular Macros'}
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
