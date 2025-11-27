'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { Lang } from '@/lib/i18n';

export function MacroCalculatorClient({ lang }: { lang: Lang }) {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'>('moderate');
  const [goal, setGoal] = useState<'cut' | 'maintain' | 'bulk'>('maintain');
  const [proteinRatio, setProteinRatio] = useState(0.3);
  const [carbRatio, setCarbRatio] = useState(0.4);
  const [fatRatio, setFatRatio] = useState(0.3);

  const calculateMacros = () => {
    if (!age || !height || !weight) return null;

    const ageNum = parseFloat(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (isNaN(ageNum) || isNaN(heightNum) || isNaN(weightNum)) return null;

    // BMR calculation (Mifflin-St Jeor Equation)
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      'very-active': 1.9,
    };

    // TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityMultipliers[activityLevel];

    // Goal adjustments
    let targetCalories: number;
    if (goal === 'cut') {
      targetCalories = tdee * 0.85; // 15% deficit
    } else if (goal === 'bulk') {
      targetCalories = tdee * 1.15; // 15% surplus
    } else {
      targetCalories = tdee; // Maintain
    }

    // Calculate macros (1g protein = 4 cal, 1g carb = 4 cal, 1g fat = 9 cal)
    const protein = Math.round((targetCalories * proteinRatio) / 4);
    const carbs = Math.round((targetCalories * carbRatio) / 4);
    const fats = Math.round((targetCalories * fatRatio) / 9);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      protein,
      carbs,
      fats,
    };
  };

  const results = calculateMacros();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            {lang === 'en' ? 'Your Information' : 'Tu Información'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Gender' : 'Género'}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={gender === 'male' ? 'default' : 'secondary'}
                  onClick={() => setGender('male')}
                  className="flex-1"
                >
                  {lang === 'en' ? 'Male' : 'Hombre'}
                </Button>
                <Button
                  variant={gender === 'female' ? 'default' : 'secondary'}
                  onClick={() => setGender('female')}
                  className="flex-1"
                >
                  {lang === 'en' ? 'Female' : 'Mujer'}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Age' : 'Edad'}
              </label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Height (cm)' : 'Altura (cm)'}
              </label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Weight (kg)' : 'Peso (kg)'}
              </label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Activity Level' : 'Nivel de Actividad'}
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50"
              >
                <option value="sedentary">{lang === 'en' ? 'Sedentary' : 'Sedentario'}</option>
                <option value="light">{lang === 'en' ? 'Light Exercise (1-3 days/week)' : 'Ejercicio Ligero (1-3 días/semana)'}</option>
                <option value="moderate">{lang === 'en' ? 'Moderate Exercise (3-5 days/week)' : 'Ejercicio Moderado (3-5 días/semana)'}</option>
                <option value="active">{lang === 'en' ? 'Active (6-7 days/week)' : 'Activo (6-7 días/semana)'}</option>
                <option value="very-active">{lang === 'en' ? 'Very Active (2x/day)' : 'Muy Activo (2x/día)'}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Goal' : 'Objetivo'}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={goal === 'cut' ? 'default' : 'secondary'}
                  onClick={() => setGoal('cut')}
                  className="flex-1"
                >
                  <TrendingDown className="w-4 h-4 mr-1" />
                  {lang === 'en' ? 'Cut' : 'Definir'}
                </Button>
                <Button
                  variant={goal === 'maintain' ? 'default' : 'secondary'}
                  onClick={() => setGoal('maintain')}
                  className="flex-1"
                >
                  {lang === 'en' ? 'Maintain' : 'Mantener'}
                </Button>
                <Button
                  variant={goal === 'bulk' ? 'default' : 'secondary'}
                  onClick={() => setGoal('bulk')}
                  className="flex-1"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {lang === 'en' ? 'Bulk' : 'Aumentar'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                {lang === 'en' ? 'Your Macros' : 'Tus Macros'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">{lang === 'en' ? 'Daily Calories' : 'Calorías Diarias'}</p>
                <p className="text-3xl font-bold text-emerald-400">{results.targetCalories}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60">
                  <div>
                    <p className="font-semibold">{lang === 'en' ? 'Protein' : 'Proteína'}</p>
                    <p className="text-xs text-slate-400">{Math.round(results.protein * 4)} {lang === 'en' ? 'calories' : 'calorías'}</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{results.protein}g</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60">
                  <div>
                    <p className="font-semibold">{lang === 'en' ? 'Carbs' : 'Carbohidratos'}</p>
                    <p className="text-xs text-slate-400">{Math.round(results.carbs * 4)} {lang === 'en' ? 'calories' : 'calorías'}</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{results.carbs}g</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60">
                  <div>
                    <p className="font-semibold">{lang === 'en' ? 'Fats' : 'Grasas'}</p>
                    <p className="text-xs text-slate-400">{Math.round(results.fats * 9)} {lang === 'en' ? 'calories' : 'calorías'}</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{results.fats}g</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{lang === 'en' ? 'Metabolism Info' : 'Información del Metabolismo'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">{lang === 'en' ? 'BMR (Basal Metabolic Rate)' : 'TMB (Tasa Metabólica Basal)'}</p>
                <p className="text-2xl font-bold">{results.bmr} {lang === 'en' ? 'calories/day' : 'calorías/día'}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'en' ? 'Calories burned at rest' : 'Calorías quemadas en reposo'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">{lang === 'en' ? 'TDEE (Total Daily Energy Expenditure)' : 'GET (Gasto Energético Total)'}</p>
                <p className="text-2xl font-bold">{results.tdee} {lang === 'en' ? 'calories/day' : 'calorías/día'}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'en' ? 'Calories burned with activity' : 'Calorías quemadas con actividad'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!results && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calculator className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {lang === 'en'
                ? 'Fill in your information above to calculate your macros'
                : 'Completa tu información arriba para calcular tus macros'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

