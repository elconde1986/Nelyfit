import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Dumbbell, CheckCircle, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminExercisesPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const exercises = await prisma.exercise.findMany({
    include: {
      _count: {
        select: { workoutExercises: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const stats = {
    total: exercises.length,
    global: exercises.length, // All exercises are global in current schema
    coachCreated: 0, // No coach relation in Exercise model
    totalUsage: exercises.reduce((sum, e) => sum + e._count.workoutExercises, 0),
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
              {lang === 'en' ? 'Exercise Library Management' : 'Gestión de Biblioteca de Ejercicios'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'Manage and verify exercises across the platform'
              : 'Gestiona y verifica ejercicios en la plataforma'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Exercises' : 'Ejercicios Totales'}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Global' : 'Globales'}</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.global}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Coach Created' : 'Creados por Entrenadores'}</p>
              <p className="text-2xl font-bold text-blue-400">{stats.coachCreated}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Usage' : 'Uso Total'}</p>
              <p className="text-2xl font-bold text-purple-400">{stats.totalUsage}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'All Exercises' : 'Todos los Ejercicios'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Dumbbell className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-semibold">{exercise.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {exercise.category && <span>{exercise.category}</span>}
                        {exercise.equipment && (
                          <>
                            <span>•</span>
                            <span>{exercise.equipment}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{exercise._count.workoutExercises} {lang === 'en' ? 'uses' : 'usos'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-xs">
                      {lang === 'en' ? 'Global' : 'Global'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {exercises.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No exercises found' : 'No se encontraron ejercicios'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

