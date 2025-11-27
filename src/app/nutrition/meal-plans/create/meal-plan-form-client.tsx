'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Utensils, Plus, X, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lang } from '@/lib/i18n';

type Meal = {
  id: string;
  name: string;
  mealType: string;
  day: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  notes?: string;
};

type Client = {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

export function MealPlanFormClient({
  coachId,
  clients,
  lang,
}: {
  coachId: string;
  clients: Client[];
  lang: Lang;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
    days: '1',
    assignedTo: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [meals, setMeals] = useState<Meal[]>([]);

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        id: `meal-${Date.now()}`,
        name: '',
        mealType: 'breakfast',
        day: 1,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        ingredients: [],
        notes: '',
      },
    ]);
  };

  const updateMeal = (id: string, field: keyof Meal, value: any) => {
    setMeals(meals.map(m => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const addIngredient = (mealId: string, ingredient: string) => {
    if (!ingredient.trim()) return;
    setMeals(
      meals.map(m =>
        m.id === mealId
          ? { ...m, ingredients: [...m.ingredients, ingredient.trim()] }
          : m
      )
    );
  };

  const removeIngredient = (mealId: string, index: number) => {
    setMeals(
      meals.map(m =>
        m.id === mealId
          ? { ...m, ingredients: m.ingredients.filter((_, i) => i !== index) }
          : m
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/nutrition/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          meals: meals.map(m => ({
            name: m.name,
            mealType: m.mealType,
            day: m.day,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fats: m.fats,
            ingredients: m.ingredients,
            notes: m.notes || null,
          })),
        }),
      });

      if (res.ok) {
        const { mealPlan } = await res.json();
        router.push(`/nutrition/meal-plans/${mealPlan.id}`);
      } else {
        const error = await res.json();
        alert(error.error || (lang === 'en' ? 'Failed to create meal plan' : 'Error al crear plan de comida'));
      }
    } catch (error) {
      console.error('Error creating meal plan:', error);
      alert(lang === 'en' ? 'An error occurred' : 'Ocurrió un error');
    } finally {
      setSaving(false);
    }
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold">
          <span className="gradient-text">
            {lang === 'en' ? 'Create Meal Plan' : 'Crear Plan de Comida'}
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {lang === 'en'
            ? 'Create a structured meal plan for your clients'
            : 'Crea un plan de comida estructurado para tus clientes'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Plan Details' : 'Detalles del Plan'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Plan Name' : 'Nombre del Plan'} *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'Goal' : 'Objetivo'}
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                >
                  <option value="">{lang === 'en' ? 'Select...' : 'Seleccionar...'}</option>
                  <option value="cutting">{lang === 'en' ? 'Cutting' : 'Definición'}</option>
                  <option value="maintenance">{lang === 'en' ? 'Maintenance' : 'Mantenimiento'}</option>
                  <option value="bulking">{lang === 'en' ? 'Bulking' : 'Volumen'}</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'Days per Cycle' : 'Días por Ciclo'}
                </label>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'Calories' : 'Calorías'} *
                </label>
                <Input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'Protein (g)' : 'Proteína (g)'} *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'Carbs (g)' : 'Carbohidratos (g)'} *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'Fats (g)' : 'Grasas (g)'} *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.fats}
                  onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'Start Date' : 'Fecha Inicio'}
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'End Date (optional)' : 'Fecha Fin (opcional)'}
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'Assign To Client' : 'Asignar a Cliente'}
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                >
                  <option value="">{lang === 'en' ? 'None' : 'Ninguno'}</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.user ? (client.user.name || client.user.email || 'Unknown') : 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{lang === 'en' ? 'Meals' : 'Comidas'}</CardTitle>
              <Button type="button" variant="secondary" size="sm" onClick={addMeal}>
                <Plus className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Add Meal' : 'Agregar Comida'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {meals.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>{lang === 'en' ? 'No meals added yet' : 'Aún no se han agregado comidas'}</p>
                <Button type="button" variant="secondary" className="mt-4" onClick={addMeal}>
                  <Plus className="w-4 h-4 mr-2" />
                  {lang === 'en' ? 'Add First Meal' : 'Agregar Primera Comida'}
                </Button>
              </div>
            ) : (
              meals.map((meal, idx) => (
                <Card key={meal.id} className="bg-slate-900/60">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {lang === 'en' ? 'Meal' : 'Comida'} {idx + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMeal(meal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          {lang === 'en' ? 'Meal Name' : 'Nombre'} *
                        </label>
                        <Input
                          value={meal.name}
                          onChange={(e) => updateMeal(meal.id, 'name', e.target.value)}
                          className="bg-slate-800 border-slate-700 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          {lang === 'en' ? 'Type' : 'Tipo'} *
                        </label>
                        <select
                          value={meal.mealType}
                          onChange={(e) => updateMeal(meal.id, 'mealType', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                        >
                          <option value="breakfast">{lang === 'en' ? 'Breakfast' : 'Desayuno'}</option>
                          <option value="lunch">{lang === 'en' ? 'Lunch' : 'Almuerzo'}</option>
                          <option value="dinner">{lang === 'en' ? 'Dinner' : 'Cena'}</option>
                          <option value="snack">{lang === 'en' ? 'Snack' : 'Merienda'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          {lang === 'en' ? 'Day' : 'Día'}
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max={parseInt(formData.days) || 7}
                          value={meal.day}
                          onChange={(e) => updateMeal(meal.id, 'day', parseInt(e.target.value) || 1)}
                          className="bg-slate-800 border-slate-700 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          {lang === 'en' ? 'Calories' : 'Calorías'} *
                        </label>
                        <Input
                          type="number"
                          value={meal.calories}
                          onChange={(e) => updateMeal(meal.id, 'calories', parseInt(e.target.value) || 0)}
                          className="bg-slate-800 border-slate-700 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          {lang === 'en' ? 'Protein (g)' : 'Proteína (g)'} *
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={meal.protein}
                          onChange={(e) => updateMeal(meal.id, 'protein', parseFloat(e.target.value) || 0)}
                          className="bg-slate-800 border-slate-700 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          {lang === 'en' ? 'Carbs (g)' : 'Carbohidratos (g)'} *
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={meal.carbs}
                          onChange={(e) => updateMeal(meal.id, 'carbs', parseFloat(e.target.value) || 0)}
                          className="bg-slate-800 border-slate-700 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          {lang === 'en' ? 'Fats (g)' : 'Grasas (g)'} *
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={meal.fats}
                          onChange={(e) => updateMeal(meal.id, 'fats', parseFloat(e.target.value) || 0)}
                          className="bg-slate-800 border-slate-700 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">
                        {lang === 'en' ? 'Ingredients' : 'Ingredientes'}
                      </label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          type="text"
                          placeholder={lang === 'en' ? 'Add ingredient...' : 'Agregar ingrediente...'}
                          className="bg-slate-800 border-slate-700 text-sm flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addIngredient(meal.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {meal.ingredients.map((ing, ingIdx) => (
                          <span
                            key={ingIdx}
                            className="px-2 py-1 bg-slate-800 rounded text-xs flex items-center gap-1"
                          >
                            {ing}
                            <button
                              type="button"
                              onClick={() => removeIngredient(meal.id, ingIdx)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">
                        {lang === 'en' ? 'Notes/Instructions' : 'Notas/Instrucciones'}
                      </label>
                      <textarea
                        value={meal.notes || ''}
                        onChange={(e) => updateMeal(meal.id, 'notes', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                        placeholder={lang === 'en' ? 'Add cooking instructions...' : 'Agregar instrucciones de cocción...'}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Summary */}
            {meals.length > 0 && (
              <div className="mt-4 p-4 bg-slate-900/60 rounded-lg">
                <h4 className="font-semibold mb-2">{lang === 'en' ? 'Meal Summary' : 'Resumen de Comidas'}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">{lang === 'en' ? 'Total Calories:' : 'Calorías Totales:'}</span>
                    <p className="font-bold">{totalCalories}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">{lang === 'en' ? 'Total Protein:' : 'Proteína Total:'}</span>
                    <p className="font-bold">{totalProtein.toFixed(1)}g</p>
                  </div>
                  <div>
                    <span className="text-slate-400">{lang === 'en' ? 'Total Carbs:' : 'Carbohidratos Totales:'}</span>
                    <p className="font-bold">{totalCarbs.toFixed(1)}g</p>
                  </div>
                  <div>
                    <span className="text-slate-400">{lang === 'en' ? 'Total Fats:' : 'Grasas Totales:'}</span>
                    <p className="font-bold">{totalFats.toFixed(1)}g</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={saving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {saving
              ? lang === 'en'
                ? 'Creating...'
                : 'Creando...'
              : lang === 'en'
              ? 'Create Meal Plan'
              : 'Crear Plan de Comida'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            {lang === 'en' ? 'Cancel' : 'Cancelar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

