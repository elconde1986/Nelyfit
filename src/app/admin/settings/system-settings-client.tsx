'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Users,
  Dumbbell,
  Calendar,
  TrendingUp,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';

export default function SystemSettingsClient({
  stats,
  lang,
}: {
  stats: {
    totalUsers: number;
    totalCoaches: number;
    totalClients: number;
    totalWorkouts: number;
    totalPrograms: number;
  };
  lang: Lang;
}) {
  const [settings, setSettings] = useState({
    maxProgramLength: 16,
    maxWorkoutsPerWeek: 7,
    defaultXPPerWorkout: 50,
    streakBadgeThreshold: 7,
    levelCurveMultiplier: 1.5,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // In a full implementation, this would call a server action to save settings
    setTimeout(() => {
      alert(lang === 'en' ? 'Settings saved' : 'Configuración guardada');
      setSaving(false);
    }, 500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Back' : 'Atrás'}
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">
                  {lang === 'en' ? 'System Settings' : 'Configuración del Sistema'}
                </span>
              </h1>
              <p className="text-slate-400 mt-1">
                {lang === 'en'
                  ? 'Manage platform-wide settings and limits'
                  : 'Gestiona configuraciones y límites de la plataforma'}
              </p>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{lang === 'en' ? 'Users' : 'Usuarios'}</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{lang === 'en' ? 'Coaches' : 'Entrenadores'}</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.totalCoaches}</p>
                </div>
                <Users className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{lang === 'en' ? 'Clients' : 'Clientes'}</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.totalClients}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{lang === 'en' ? 'Workouts' : 'Entrenamientos'}</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.totalWorkouts}</p>
                </div>
                <Dumbbell className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{lang === 'en' ? 'Programs' : 'Programas'}</p>
                  <p className="text-2xl font-bold text-pink-400">{stats.totalPrograms}</p>
                </div>
                <Calendar className="w-8 h-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Program & Workout Limits */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {lang === 'en' ? 'Program & Workout Limits' : 'Límites de Programas y Entrenamientos'}
            </CardTitle>
            <CardDescription>
              {lang === 'en'
                ? 'Control maximum program length and workout frequency'
                : 'Controla la duración máxima de programas y frecuencia de entrenamientos'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                {lang === 'en' ? 'Maximum Program Length (weeks)' : 'Duración Máxima del Programa (semanas)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="4"
                  max="52"
                  value={settings.maxProgramLength}
                  onChange={(e) =>
                    setSettings({ ...settings, maxProgramLength: parseInt(e.target.value) })
                  }
                  className="flex-1"
                />
                <span className="text-sm w-16 text-right">{settings.maxProgramLength} weeks</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">
                {lang === 'en'
                  ? 'Maximum Workouts Per Week (soft limit)'
                  : 'Máximo de Entrenamientos por Semana (límite suave)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={settings.maxWorkoutsPerWeek}
                  onChange={(e) =>
                    setSettings({ ...settings, maxWorkoutsPerWeek: parseInt(e.target.value) })
                  }
                  className="flex-1"
                />
                <span className="text-sm w-16 text-right">{settings.maxWorkoutsPerWeek} workouts</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en'
                  ? 'Warning shown if exceeded, but not enforced'
                  : 'Advertencia mostrada si se excede, pero no se aplica'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gamification Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {lang === 'en' ? 'Gamification Settings' : 'Configuración de Gamificación'}
            </CardTitle>
            <CardDescription>
              {lang === 'en'
                ? 'Control XP rewards, streaks, and level progression'
                : 'Controla recompensas de XP, rachas y progresión de niveles'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                {lang === 'en' ? 'Default XP per Workout' : 'XP Predeterminado por Entrenamiento'}
              </label>
              <input
                type="number"
                min="10"
                max="200"
                value={settings.defaultXPPerWorkout}
                onChange={(e) =>
                  setSettings({ ...settings, defaultXPPerWorkout: parseInt(e.target.value) || 50 })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">
                {lang === 'en' ? 'Streak Badge Threshold (days)' : 'Umbral de Insignia de Rachas (días)'}
              </label>
              <input
                type="number"
                min="3"
                max="30"
                value={settings.streakBadgeThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, streakBadgeThreshold: parseInt(e.target.value) || 7 })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">
                {lang === 'en' ? 'Level Curve Multiplier' : 'Multiplicador de Curva de Nivel'}
              </label>
              <input
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={settings.levelCurveMultiplier}
                onChange={(e) =>
                  setSettings({ ...settings, levelCurveMultiplier: parseFloat(e.target.value) || 1.5 })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
              />
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en'
                  ? 'Higher = more XP needed per level'
                  : 'Mayor = más XP necesario por nivel'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Permissions & Roles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {lang === 'en' ? 'Permissions & Roles' : 'Permisos y Roles'}
            </CardTitle>
            <CardDescription>
              {lang === 'en'
                ? 'Manage coach permissions and role templates'
                : 'Gestiona permisos de entrenadores y plantillas de roles'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg">
                <div>
                  <p className="font-semibold">{lang === 'en' ? 'Standard Coach' : 'Entrenador Estándar'}</p>
                  <p className="text-xs text-slate-400">
                    {lang === 'en'
                      ? 'Can create private workouts, assign to clients'
                      : 'Puede crear entrenamientos privados, asignar a clientes'}
                  </p>
                </div>
                <Badge variant="default">
                  {lang === 'en' ? 'Default' : 'Predeterminado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg">
                <div>
                  <p className="font-semibold">{lang === 'en' ? 'Lead Coach' : 'Entrenador Principal'}</p>
                  <p className="text-xs text-slate-400">
                    {lang === 'en'
                      ? 'Can publish global workouts, create marketplace templates'
                      : 'Puede publicar entrenamientos globales, crear plantillas de mercado'}
                  </p>
                </div>
                <Badge variant="secondary">
                  {lang === 'en' ? 'Premium' : 'Premium'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {saving
              ? lang === 'en'
                ? 'Saving...'
                : 'Guardando...'
              : lang === 'en'
              ? 'Save Settings'
              : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </main>
  );
}

