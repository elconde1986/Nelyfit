import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { ShoppingCart, Plus, Check, X, Utensils } from 'lucide-react';
import { GroceryListClient } from './grocery-list-client';

export const dynamic = 'force-dynamic';

export default async function GroceryListsPage() {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  // Get user's active meal plans
  const mealPlans = await prisma.mealPlan.findMany({
    where: {
      userId: user.id,
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ],
    },
    include: {
      meals: true,
    },
    orderBy: { startDate: 'desc' },
  });

  // Extract all ingredients from active meal plans
  const allIngredients: { name: string; mealPlanName: string; mealType: string }[] = [];
  mealPlans.forEach(plan => {
    plan.meals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        allIngredients.push({
          name: ingredient,
          mealPlanName: plan.name,
          mealType: meal.mealType,
        });
      });
    });
  });

  // Group ingredients by name and count occurrences
  const ingredientMap = new Map<string, { count: number; sources: string[] }>();
  allIngredients.forEach(ing => {
    const existing = ingredientMap.get(ing.name) || { count: 0, sources: [] };
    existing.count += 1;
    if (!existing.sources.includes(ing.mealPlanName)) {
      existing.sources.push(ing.mealPlanName);
    }
    ingredientMap.set(ing.name, existing);
  });

  const groceryList = Array.from(ingredientMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    sources: data.sources,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">
                {lang === 'en' ? 'Grocery List' : 'Lista de Compras'}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {lang === 'en'
                ? 'Auto-generated from your active meal plans'
                : 'Generado automáticamente desde tus planes de comida activos'}
            </p>
          </div>
          <Button asChild variant="secondary">
            <a href="/nutrition/meal-plans">
              <Utensils className="w-4 h-4 mr-2" />
              {lang === 'en' ? 'View Meal Plans' : 'Ver Planes de Comida'}
            </a>
          </Button>
        </header>

        {mealPlans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">
                {lang === 'en'
                  ? 'No active meal plans. Create a meal plan to generate your grocery list.'
                  : 'No hay planes de comida activos. Crea un plan de comida para generar tu lista de compras.'}
              </p>
              <Button asChild>
                <a href="/nutrition/meal-plans">
                  <Plus className="w-4 h-4 mr-2" />
                  {lang === 'en' ? 'View Meal Plans' : 'Ver Planes de Comida'}
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <GroceryListClient
            groceryList={groceryList}
            mealPlans={mealPlans.map(p => ({ id: p.id, name: p.name }))}
            lang={lang}
          />
        )}
      </div>
    </main>
  );
}

