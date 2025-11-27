'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Lang } from '@/lib/i18n';

type WorkoutExercise = {
  id: string;
  exerciseId?: string;
  exercise?: any;
  name: string;
  category?: string;
  equipment?: string;
  musclesTargeted: string[];
  notes?: string;
  coachNotes?: string;
  sets: number;
  reps?: number;
  repRangeMin?: number;
  repRangeMax?: number;
  timeSeconds?: number;
  distance?: number;
  restSeconds?: number;
  loadType?: 'WEIGHT' | 'RPE' | 'PERCENT' | 'BODYWEIGHT';
  loadValue?: number;
  targetRepsBySet: number[];
  targetWeightBySet?: (number | null)[];
  targetRestBySet?: number[];
  targetRPEBySet?: number[];
  isOptional?: boolean;
  isCoachChoice?: boolean;
  order: number;
  groupType?: 'NONE' | 'SUPERSET' | 'CIRCUIT' | 'EMOM' | 'AMRAP';
  groupKey?: string;
};

export default function ExerciseConfigPanel({
  exercise,
  onUpdate,
  onClose,
  lang,
}: {
  exercise: WorkoutExercise;
  onUpdate: (exercise: WorkoutExercise) => void;
  onClose: () => void;
  lang: Lang;
}) {
  const [config, setConfig] = useState<WorkoutExercise>(exercise);

  useEffect(() => {
    setConfig(exercise);
  }, [exercise]);

  const handleSave = () => {
    onUpdate(config);
  };

  const updateConfig = (updates: Partial<WorkoutExercise>) => {
    setConfig({ ...config, ...updates });
  };

  const addSet = () => {
    const newReps = [...config.targetRepsBySet, config.reps || 10];
    const newWeights = [...(config.targetWeightBySet || []), null];
    const newRest = [...(config.targetRestBySet || []), config.restSeconds || 60];
    updateConfig({
      sets: config.sets + 1,
      targetRepsBySet: newReps,
      targetWeightBySet: newWeights,
      targetRestBySet: newRest,
    });
  };

  const removeSet = (index: number) => {
    if (config.sets <= 1) return;
    const newReps = config.targetRepsBySet.filter((_, i) => i !== index);
    const newWeights = (config.targetWeightBySet || []).filter((_, i) => i !== index);
    const newRest = (config.targetRestBySet || []).filter((_, i) => i !== index);
    updateConfig({
      sets: config.sets - 1,
      targetRepsBySet: newReps,
      targetWeightBySet: newWeights,
      targetRestBySet: newRest,
    });
  };

  const updateSetValue = (index: number, field: 'reps' | 'weight' | 'rest', value: number | null) => {
    if (field === 'reps') {
      const newReps = [...config.targetRepsBySet];
      newReps[index] = value as number;
      updateConfig({ targetRepsBySet: newReps });
    } else if (field === 'weight') {
      const newWeights = [...(config.targetWeightBySet || [])];
      newWeights[index] = value;
      updateConfig({ targetWeightBySet: newWeights });
    } else if (field === 'rest') {
      const newRest = [...(config.targetRestBySet || [])];
      newRest[index] = value as number;
      updateConfig({ targetRestBySet: newRest });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-lg">{config.name}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Exercise Info (Read-only) */}
        {config.exercise && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{lang === 'en' ? 'Exercise Info' : 'Información del Ejercicio'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {config.exercise.musclesTargeted && config.exercise.musclesTargeted.length > 0 && (
                <div>
                  <span className="text-slate-400">{lang === 'en' ? 'Muscles' : 'Músculos'}: </span>
                  <span className="text-slate-300">{config.exercise.musclesTargeted.join(', ')}</span>
                </div>
              )}
              {config.exercise.equipment && (
                <div>
                  <span className="text-slate-400">{lang === 'en' ? 'Equipment' : 'Equipamiento'}: </span>
                  <span className="text-slate-300">{config.exercise.equipment}</span>
                </div>
              )}
              {config.exercise.category && (
                <div>
                  <span className="text-slate-400">{lang === 'en' ? 'Category' : 'Categoría'}: </span>
                  <Badge variant="secondary" className="text-xs">{config.exercise.category}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sets Configuration */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{lang === 'en' ? 'Sets & Reps' : 'Series y Repeticiones'}</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={config.sets}
                  onChange={(e) => {
                    const sets = parseInt(e.target.value) || 1;
                    const currentSets = config.targetRepsBySet.length;
                    if (sets > currentSets) {
                      // Add sets
                      const newReps = [...config.targetRepsBySet];
                      const newWeights = [...(config.targetWeightBySet || [])];
                      const newRest = [...(config.targetRestBySet || [])];
                      for (let i = currentSets; i < sets; i++) {
                        newReps.push(config.reps || 10);
                        newWeights.push(null);
                        newRest.push(config.restSeconds || 60);
                      }
                      updateConfig({
                        sets,
                        targetRepsBySet: newReps,
                        targetWeightBySet: newWeights,
                        targetRestBySet: newRest,
                      });
                    } else if (sets < currentSets) {
                      // Remove sets
                      updateConfig({
                        sets,
                        targetRepsBySet: config.targetRepsBySet.slice(0, sets),
                        targetWeightBySet: (config.targetWeightBySet || []).slice(0, sets),
                        targetRestBySet: (config.targetRestBySet || []).slice(0, sets),
                      });
                    } else {
                      updateConfig({ sets });
                    }
                  }}
                  className="w-16 px-2 py-1 text-sm bg-slate-800 border-slate-700"
                  min={1}
                />
                <span className="text-xs text-slate-400">{lang === 'en' ? 'sets' : 'series'}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {config.targetRepsBySet.map((reps, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded bg-slate-900/60">
                <span className="text-xs text-slate-400 w-8">#{idx + 1}</span>
                <Input
                  type="number"
                  value={reps}
                  onChange={(e) => updateSetValue(idx, 'reps', parseInt(e.target.value) || 0)}
                  placeholder="Reps"
                  className="w-20 px-2 py-1 text-sm bg-slate-800 border-slate-700"
                />
                <Input
                  type="number"
                  value={config.targetWeightBySet?.[idx] || ''}
                  onChange={(e) => updateSetValue(idx, 'weight', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder={lang === 'en' ? 'Weight' : 'Peso'}
                  className="w-20 px-2 py-1 text-sm bg-slate-800 border-slate-700"
                />
                <span className="text-xs text-slate-400">kg</span>
                <Input
                  type="number"
                  value={config.targetRestBySet?.[idx] || config.restSeconds || 60}
                  onChange={(e) => updateSetValue(idx, 'rest', parseInt(e.target.value) || 60)}
                  placeholder="Rest"
                  className="w-16 px-2 py-1 text-sm bg-slate-800 border-slate-700"
                />
                <span className="text-xs text-slate-400">s</span>
                {config.sets > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSet(idx)}
                    className="ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addSet} className="w-full">
              <Plus className="w-3 h-3 mr-1" />
              {lang === 'en' ? 'Add Set' : 'Agregar Serie'}
            </Button>
          </CardContent>
        </Card>

        {/* Load Prescription */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{lang === 'en' ? 'Load Prescription' : 'Prescripción de Carga'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                {lang === 'en' ? 'Type' : 'Tipo'}
              </label>
              <select
                value={config.loadType || 'WEIGHT'}
                onChange={(e) => updateConfig({ loadType: e.target.value as any })}
                className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-50 text-sm"
              >
                <option value="WEIGHT">{lang === 'en' ? 'Weight' : 'Peso'}</option>
                <option value="RPE">{lang === 'en' ? 'RPE' : 'RPE'}</option>
                <option value="PERCENT">{lang === 'en' ? '% of 1RM' : '% de 1RM'}</option>
                <option value="BODYWEIGHT">{lang === 'en' ? 'Bodyweight' : 'Peso Corporal'}</option>
              </select>
            </div>
            {config.loadType !== 'BODYWEIGHT' && (
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">
                  {config.loadType === 'RPE' ? 'RPE' : config.loadType === 'PERCENT' ? '%' : lang === 'en' ? 'Weight (kg)' : 'Peso (kg)'}
                </label>
                <Input
                  type="number"
                  value={config.loadValue || ''}
                  onChange={(e) => updateConfig({ loadValue: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-2 py-1.5 bg-slate-800 border-slate-700 text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rest */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{lang === 'en' ? 'Rest' : 'Descanso'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={config.restSeconds || 60}
              onChange={(e) => {
                const rest = parseInt(e.target.value) || 60;
                updateConfig({
                  restSeconds: rest,
                  targetRestBySet: (config.targetRestBySet || []).map(() => rest),
                });
              }}
              className="w-full px-2 py-1.5 bg-slate-800 border-slate-700 text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'en' ? 'Default rest between sets (seconds)' : 'Descanso predeterminado entre series (segundos)'}
            </p>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{lang === 'en' ? 'Notes' : 'Notas'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                {lang === 'en' ? 'Client Notes' : 'Notas para Cliente'}
              </label>
              <textarea
                value={config.notes || ''}
                onChange={(e) => updateConfig({ notes: e.target.value })}
                rows={3}
                className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                placeholder={lang === 'en' ? 'Coaching cues, form tips...' : 'Indicaciones, consejos de forma...'}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                {lang === 'en' ? 'Coach Notes (Private)' : 'Notas del Entrenador (Privadas)'}
              </label>
              <textarea
                value={config.coachNotes || ''}
                onChange={(e) => updateConfig({ coachNotes: e.target.value })}
                rows={2}
                className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                placeholder={lang === 'en' ? 'Private notes...' : 'Notas privadas...'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{lang === 'en' ? 'Options' : 'Opciones'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.isOptional || false}
                onChange={(e) => updateConfig({ isOptional: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500"
              />
              <span className="text-sm text-slate-300">
                {lang === 'en' ? 'Make optional / bonus' : 'Hacer opcional / bonus'}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.isCoachChoice || false}
                onChange={(e) => updateConfig({ isCoachChoice: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500"
              />
              <span className="text-sm text-slate-300">
                {lang === 'en' ? 'Coach choice' : 'Elección del entrenador'}
              </span>
            </label>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 border-t border-slate-800">
        <Button onClick={handleSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {lang === 'en' ? 'Save Changes' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}

