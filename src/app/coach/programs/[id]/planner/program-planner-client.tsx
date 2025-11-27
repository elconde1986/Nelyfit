'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  GripVertical,
  Calendar,
  Dumbbell,
  Clock,
  Settings,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';
import { updateProgramStructure, assignWorkoutToDay } from './actions';
import AutoGenerateModal from './auto-generate';

type ProgramDay = {
  id?: string;
  dayIndex: number;
  title: string;
  workoutId?: string | null;
  isRestDay: boolean;
  notes?: string | null;
  intensityOverride?: string | null;
  tags?: string[];
};

type ProgramWeek = {
  id: string;
  weekNumber: number;
  title?: string | null;
  weekFocus?: string | null;
  days: ProgramDay[];
};

export default function ProgramPlannerClient({
  program,
  workouts,
  coachId,
  lang,
}: {
  program: any;
  workouts: any[];
  coachId: string;
  lang: Lang;
}) {
  const router = useRouter();
  const t = translations.coach[lang] || translations.coach.en;
  const [saving, setSaving] = useState(false);
  const [weeks, setWeeks] = useState<ProgramWeek[]>(
    program.weeks.map((week: any) => ({
      id: week.id,
      weekNumber: week.weekNumber,
      title: week.title,
      weekFocus: week.weekFocus || 'NORMAL',
      days: week.days.map((day: any) => ({
        id: day.id,
        dayIndex: day.dayIndex,
        title: day.title,
        workoutId: day.workoutId,
        isRestDay: day.isRestDay,
        notes: day.notes,
        intensityOverride: day.intensityOverride,
        tags: day.tags || [],
      })),
    }))
  );
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [showWorkoutLibrary, setShowWorkoutLibrary] = useState(false);
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);

  const dayNames = lang === 'en' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const handleAssignWorkout = async (weekIndex: number, dayIndex: number, workoutId: string | null) => {
    const week = weeks[weekIndex];
    const day = week.days.find((d) => d.dayIndex === dayIndex);
    
    if (!day) return;

    setSaving(true);
    try {
      const result = await assignWorkoutToDay({
        programId: program.id,
        weekNumber: week.weekNumber,
        dayIndex,
        workoutId,
      });

      if (result.success) {
        // Update local state
        const updatedWeeks = [...weeks];
        updatedWeeks[weekIndex] = {
          ...week,
          days: week.days.map((d) =>
            d.dayIndex === dayIndex
              ? { ...d, workoutId, isRestDay: !workoutId }
              : d
          ),
        };
        setWeeks(updatedWeeks);
        setSelectedWorkout(null);
      }
    } catch (error) {
      console.error('Error assigning workout:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateProgramStructure(program.id, weeks);
      if (result.success) {
        router.refresh();
        alert(lang === 'en' ? 'Program saved!' : '¡Programa guardado!');
      }
    } catch (error) {
      console.error('Error saving program:', error);
      alert(lang === 'en' ? 'Failed to save program' : 'Error al guardar programa');
    } finally {
      setSaving(false);
    }
  };

  const getWorkoutForDay = (weekIndex: number, dayIndex: number) => {
    const week = weeks[weekIndex];
    const day = week.days.find((d) => d.dayIndex === dayIndex);
    if (!day || day.isRestDay || !day.workoutId) return null;
    return workouts.find((w) => w.id === day.workoutId);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/coach/programs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">{program.name}</span>
              </h1>
              <p className="text-slate-400 mt-1">
                {lang === 'en' ? 'Program Planner' : 'Planificador de Programa'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowAutoGenerate(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {lang === 'en' ? 'Auto-Generate' : 'Generar Automáticamente'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowWorkoutLibrary(!showWorkoutLibrary)}
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              {lang === 'en' ? 'Workout Library' : 'Biblioteca de Entrenamientos'}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? (lang === 'en' ? 'Saving...' : 'Guardando...') : (lang === 'en' ? 'Save' : 'Guardar')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {weeks.map((week, weekIndex) => (
                <Card key={week.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {lang === 'en' ? 'Week' : 'Semana'} {week.weekNumber}
                        {week.title && `: ${week.title}`}
                      </span>
                      <select
                        value={week.weekFocus || 'NORMAL'}
                        onChange={(e) => {
                          const updated = [...weeks];
                          updated[weekIndex] = { ...week, weekFocus: e.target.value };
                          setWeeks(updated);
                        }}
                        className="px-2 py-1 rounded bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
                      >
                        <option value="NORMAL">{lang === 'en' ? 'Normal' : 'Normal'}</option>
                        <option value="BUILD">{lang === 'en' ? 'Build' : 'Construir'}</option>
                        <option value="DELOAD">{lang === 'en' ? 'Deload' : 'Descarga'}</option>
                        <option value="PEAK">{lang === 'en' ? 'Peak' : 'Pico'}</option>
                      </select>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {dayNames.map((dayName, dayIdx) => {
                        const dayIndex = dayIdx + 1;
                        const day = week.days.find((d) => d.dayIndex === dayIndex);
                        const workout = getWorkoutForDay(weekIndex, dayIndex);
                        const isRestDay = day?.isRestDay || false;

                        return (
                          <div
                            key={dayIdx}
                            className={`min-h-[120px] p-2 rounded-lg border-2 ${
                              workout
                                ? 'border-emerald-500/50 bg-emerald-500/10'
                                : isRestDay
                                ? 'border-yellow-500/50 bg-yellow-500/10'
                                : 'border-slate-700 bg-slate-900/60'
                            }`}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.add('border-blue-500/50', 'bg-blue-500/10');
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove('border-blue-500/50', 'bg-blue-500/10');
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove('border-blue-500/50', 'bg-blue-500/10');
                              const workoutId = e.dataTransfer.getData('workoutId');
                              if (workoutId) {
                                handleAssignWorkout(weekIndex, dayIndex, workoutId);
                              }
                            }}
                          >
                            <div className="text-xs font-semibold text-slate-400 mb-1">
                              {dayName}
                            </div>
                            {workout ? (
                              <div className="space-y-1">
                                <div className="text-xs font-bold line-clamp-2">
                                  {workout.name}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {workout.estimatedDuration && (
                                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                      <Clock className="w-2 h-2" />
                                      {workout.estimatedDuration}m
                                    </Badge>
                                  )}
                                  {workout.difficulty && (
                                    <Badge variant="outline" className="text-xs">
                                      {workout.difficulty}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full mt-1 text-xs"
                                  onClick={() => handleAssignWorkout(weekIndex, dayIndex, null)}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  {lang === 'en' ? 'Remove' : 'Quitar'}
                                </Button>
                              </div>
                            ) : isRestDay ? (
                              <div className="text-xs text-yellow-400">
                                {lang === 'en' ? 'Rest Day' : 'Día de Descanso'}
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => {
                                  setSelectedWorkout(`${weekIndex}-${dayIndex}`);
                                  setShowWorkoutLibrary(true);
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                {lang === 'en' ? 'Add' : 'Agregar'}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Workout Library Sidebar */}
          {showWorkoutLibrary && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5" />
                      {lang === 'en' ? 'Workouts' : 'Entrenamientos'}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowWorkoutLibrary(false);
                        setSelectedWorkout(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  <div className="space-y-2">
                    {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900/80 cursor-move border border-slate-700"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('workoutId', workout.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onClick={() => {
                      if (selectedWorkout) {
                        const [weekIdx, dayIdx] = selectedWorkout.split('-').map(Number);
                        handleAssignWorkout(weekIdx, dayIdx + 1, workout.id);
                        setSelectedWorkout(null);
                      }
                    }}
                  >
                    <div className="font-semibold text-sm mb-1 flex items-center gap-2">
                      <GripVertical className="w-3 h-3 text-slate-400" />
                      {workout.name}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {workout.estimatedDuration && (
                        <Badge variant="secondary" className="text-xs">
                          {workout.estimatedDuration}m
                        </Badge>
                      )}
                      {workout.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {workout.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Auto-Generate Modal */}
        {showAutoGenerate && (
          <AutoGenerateModal
            onGenerate={async (template) => {
              // This would call an API to auto-generate workouts based on template
              // For now, we'll just show a message
              alert(
                lang === 'en'
                  ? `Auto-generation will fill program with ${template.daysPerWeek} workouts per week using ${template.pattern.join(', ')} pattern`
                  : `La generación automática llenará el programa con ${template.daysPerWeek} entrenamientos por semana usando el patrón ${template.pattern.join(', ')}`
              );
              setShowAutoGenerate(false);
            }}
            onClose={() => setShowAutoGenerate(false)}
            lang={lang}
          />
        )}
      </div>
    </main>
  );
}

