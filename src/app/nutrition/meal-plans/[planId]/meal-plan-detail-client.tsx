'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Utensils, Edit, Calendar, User, Target, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lang } from '@/lib/i18n';
import { MealPlanEditForm } from './meal-plan-edit-form';

type MealPlan = {
  id: string;
  name: string;
  goal: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number | null;
  days: number;
  assignedTo: string | null;
  startDate: Date | string;
  endDate: Date | string | null;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  meals: Array<{
    id: string;
    name: string;
    mealType: string;
    day: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: string[];
    notes: string | null;
  }>;
};

type Client = {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
} | null;

export function MealPlanDetailClient({
  mealPlan,
  assignedClient,
  canEdit,
  lang,
}: {
  mealPlan: MealPlan;
  assignedClient: Client;
  canEdit: boolean;
  lang: Lang;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const groupedMeals = mealPlan.meals.reduce((acc, meal) => {
    if (!acc[meal.day]) acc[meal.day] = [];
    acc[meal.day].push(meal);
    return acc;
  }, {} as Record<number, typeof mealPlan.meals>);

  const mealTypeLabels: Record<string, string> = {
    breakfast: lang === 'en' ? 'Breakfast' : 'Desayuno',
    lunch: lang === 'en' ? 'Lunch' : 'Almuerzo',
    dinner: lang === 'en' ? 'Dinner' : 'Cena',
    snack: lang === 'en' ? 'Snack' : 'Merienda',
  };

  const goalLabels: Record<string, string> = {
    cutting: lang === 'en' ? 'Cutting' : 'Definición',
    maintenance: lang === 'en' ? 'Maintenance' : 'Mantenimiento',
    bulking: lang === 'en' ? 'Bulking' : 'Volumen',
  };

  if (editing) {
    return (
      <MealPlanEditForm
        mealPlan={mealPlan}
        onCancel={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          router.refresh();
        }}
        lang={lang}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            <span className="gradient-text">{mealPlan.name}</span>
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            {mealPlan.goal && (
              <Badge variant="secondary">
                <Target className="w-3 h-3 mr-1" />
                {goalLabels[mealPlan.goal] || mealPlan.goal}
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(mealPlan.startDate).toLocaleDateString()}
              {mealPlan.endDate && ` - ${new Date(mealPlan.endDate).toLocaleDateString()}`}
            </span>
            {assignedClient && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {assignedClient.user.name || assignedClient.user.email}
              </span>
            )}
          </div>
        </div>
        {canEdit && (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Edit' : 'Editar'}
          </Button>
        )}
      </header>

      {/* Macro Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-400" />
            {lang === 'en' ? 'Daily Macros' : 'Macros Diarios'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Calories' : 'Calorías'}</p>
              <p className="text-2xl font-bold">{mealPlan.calories}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Protein' : 'Proteína'}</p>
              <p className="text-2xl font-bold">{mealPlan.protein}g</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Carbs' : 'Carbohidratos'}</p>
              <p className="text-2xl font-bold">{mealPlan.carbs}g</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Fats' : 'Grasas'}</p>
              <p className="text-2xl font-bold">{mealPlan.fats}g</p>
            </div>
          </div>
          {mealPlan.fiber && (
            <div className="mt-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Fiber' : 'Fibra'}</p>
              <p className="text-lg font-semibold">{mealPlan.fiber}g</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meals by Day */}
      <div className="space-y-6">
        {Array.from({ length: mealPlan.days }, (_, i) => i + 1).map(day => (
          <Card key={day}>
            <CardHeader>
              <CardTitle>
                {lang === 'en' ? 'Day' : 'Día'} {day}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedMeals[day]?.length > 0 ? (
                groupedMeals[day].map(meal => (
                  <Card key={meal.id} className="bg-slate-900/60">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-emerald-400" />
                          {meal.name}
                        </CardTitle>
                        <Badge variant="secondary">{mealTypeLabels[meal.mealType] || meal.mealType}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">{lang === 'en' ? 'Calories:' : 'Calorías:'}</span>
                          <p className="font-semibold">{meal.calories}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">{lang === 'en' ? 'Protein:' : 'Proteína:'}</span>
                          <p className="font-semibold">{meal.protein}g</p>
                        </div>
                        <div>
                          <span className="text-slate-400">{lang === 'en' ? 'Carbs:' : 'Carbohidratos:'}</span>
                          <p className="font-semibold">{meal.carbs}g</p>
                        </div>
                        <div>
                          <span className="text-slate-400">{lang === 'en' ? 'Fats:' : 'Grasas:'}</span>
                          <p className="font-semibold">{meal.fats}g</p>
                        </div>
                      </div>

                      {meal.ingredients.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-slate-300 mb-2">
                            {lang === 'en' ? 'Ingredients' : 'Ingredientes'}
                          </p>
                          <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                            {meal.ingredients.map((ing, idx) => (
                              <li key={idx}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {meal.notes && (
                        <div>
                          <p className="text-sm font-medium text-slate-300 mb-1">
                            {lang === 'en' ? 'Notes' : 'Notas'}
                          </p>
                          <p className="text-sm text-slate-400">{meal.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center py-4 text-slate-400 text-sm">
                  {lang === 'en' ? 'No meals for this day' : 'No hay comidas para este día'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

