'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, X, Settings, Link2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lang } from '@/lib/i18n';

type Exercise = {
  id: string;
  name: string;
  category?: string;
  equipment?: string;
  musclesTargeted?: string[];
  sets: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
  weight?: number;
  notes?: string;
  videoUrl?: string;
  defaultVideoUrl?: string;
  defaultThumbnailUrl?: string;
  isLibraryExercise?: boolean;
  _count?: { workoutExercises: number };
  coachVideos?: Array<{ id: string; videoUrl: string; isPrimary: boolean }>;
};

type WorkoutExercise = {
  id: string;
  exerciseId?: string;
  exercise?: Exercise;
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

type WorkoutSection = {
  id: string;
  name: string;
  type: 'WARMUP' | 'MAIN' | 'FINISHER' | 'CUSTOM';
  order: number;
  notes?: string;
  exercises: WorkoutExercise[];
};

export default function WorkoutBuilderPanel({
  sections,
  onSectionsChange,
  onAddExercise,
  onRemoveExercise,
  onSelectExercise,
  onSelectSection,
  selectedExerciseId,
  selectedSectionId,
  lang,
}: {
  sections: WorkoutSection[];
  onSectionsChange: (sections: WorkoutSection[]) => void;
  onAddExercise: (exercise: Exercise, sectionId: string) => void;
  onRemoveExercise: (sectionId: string, exerciseId: string) => void;
  onSelectExercise: (exercise: WorkoutExercise, sectionId: string) => void;
  onSelectSection?: (sectionId: string) => void;
  selectedExerciseId?: string;
  selectedSectionId?: string | null;
  lang: Lang;
}) {
  const [draggedExercise, setDraggedExercise] = useState<{ exercise: WorkoutExercise; sectionId: string } | null>(null);

  const handleDragStart = (exercise: WorkoutExercise, sectionId: string) => {
    setDraggedExercise({ exercise, sectionId });
  };

  const handleDragOver = (e: React.DragEvent, targetSectionId: string, targetIndex?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string, targetIndex?: number) => {
    e.preventDefault();
    
    // Check if we're dropping a library exercise (from external drag)
    const libraryExerciseData = e.dataTransfer.getData('application/json');
    if (libraryExerciseData) {
      try {
        const libraryExercise: Exercise = JSON.parse(libraryExerciseData);
        console.log('Dropping library exercise:', libraryExercise.name, 'to section:', targetSectionId);
        onAddExercise(libraryExercise, targetSectionId);
        return;
      } catch (err) {
        console.error('Error parsing library exercise data:', err);
      }
    }
    
    // Check if it's a text/plain drop (fallback for library exercises)
    const exerciseName = e.dataTransfer.getData('text/plain');
    if (exerciseName && !draggedExercise) {
      // This might be a library exercise, but we don't have the full data
      // The JSON should have been set, so this is a fallback
      console.warn('Received text drop but no JSON data for:', exerciseName);
      return;
    }
    
    if (!draggedExercise) return;

    const { exercise, sectionId: sourceSectionId } = draggedExercise;

    // If dropping in the same section, just reorder
    if (sourceSectionId === targetSectionId) {
      const section = sections.find(s => s.id === targetSectionId);
      if (!section) return;

      const newExercises = [...section.exercises];
      const currentIndex = newExercises.findIndex(e => e.id === exercise.id);
      if (currentIndex === -1) return;

      newExercises.splice(currentIndex, 1);
      const insertIndex = targetIndex !== undefined ? targetIndex : newExercises.length;
      newExercises.splice(insertIndex, 0, exercise);

      onSectionsChange(
        sections.map(s =>
          s.id === targetSectionId
            ? { ...s, exercises: newExercises.map((e, i) => ({ ...e, order: i })) }
            : s
        )
      );
    } else {
      // Remove from source
      const updatedSections = sections.map(s => {
        if (s.id === sourceSectionId) {
          return {
            ...s,
            exercises: s.exercises.filter(e => e.id !== exercise.id),
          };
        }
        return s;
      });

      // Add to target
      const targetSection = updatedSections.find(s => s.id === targetSectionId);
      if (targetSection) {
        const newExercises = [...targetSection.exercises];
        const insertIndex = targetIndex !== undefined ? targetIndex : newExercises.length;
        newExercises.splice(insertIndex, 0, { ...exercise, order: insertIndex });

        onSectionsChange(
          updatedSections.map(s =>
            s.id === targetSectionId
              ? { ...s, exercises: newExercises.map((e, i) => ({ ...e, order: i })) }
              : s
          )
        );
      }
    }

    setDraggedExercise(null);
  };

  const addSection = () => {
    console.log('addSection called, current sections:', sections.length);
    const newSection: WorkoutSection = {
      id: `section-${Date.now()}`,
      name: lang === 'en' ? 'New Section' : 'Nueva Sección',
      type: 'CUSTOM',
      order: sections.length,
      exercises: [],
    };
    const updatedSections = [...sections, newSection];
    console.log('Adding new section, total sections will be:', updatedSections.length);
    onSectionsChange(updatedSections);
  };

  const removeSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section && section.type === 'MAIN') {
      alert(lang === 'en' ? 'Cannot remove main section' : 'No se puede eliminar la sección principal');
      return;
    }
    onSectionsChange(sections.filter(s => s.id !== sectionId).map((s, i) => ({ ...s, order: i })));
  };

  const createGroup = (sectionId: string, exerciseIds: string[], groupType: 'SUPERSET' | 'CIRCUIT' | 'EMOM' | 'AMRAP') => {
    const groupKey = `group-${Date.now()}`;
    onSectionsChange(
      sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              exercises: s.exercises.map(e =>
                exerciseIds.includes(e.id)
                  ? { ...e, groupType, groupKey }
                  : e
              ),
            }
          : s
      )
    );
  };

  const removeFromGroup = (sectionId: string, exerciseId: string) => {
    onSectionsChange(
      sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              exercises: s.exercises.map(e =>
                e.id === exerciseId
                  ? { ...e, groupType: 'NONE', groupKey: undefined }
                  : e
              ),
            }
          : s
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {lang === 'en' ? 'Workout Builder' : 'Constructor de Entrenamiento'}
        </h2>
        <Button variant="ghost" size="sm" onClick={addSection}>
          <Plus className="w-4 h-4 mr-1" />
          {lang === 'en' ? 'Add Section' : 'Agregar Sección'}
        </Button>
      </div>

      {sections.map((section) => (
        <Card
          key={section.id}
          className={`${section.type === 'MAIN' ? 'border-emerald-500/50' : ''} ${
            selectedSectionId === section.id ? 'ring-2 ring-emerald-400' : ''
          } transition-all`}
          onClick={() => onSelectSection?.(section.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                <input
                  type="text"
                  value={section.name}
                  onChange={(e) => {
                    onSectionsChange(
                      sections.map(s =>
                        s.id === section.id ? { ...s, name: e.target.value } : s
                      )
                    );
                  }}
                  className="text-lg font-bold bg-transparent border-none outline-none text-slate-50 flex-1"
                />
                {section.type === 'MAIN' && (
                  <Badge variant="default" className="text-xs">
                    {lang === 'en' ? 'Required' : 'Requerido'}
                  </Badge>
                )}
              </div>
              {section.type !== 'MAIN' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="space-y-2 min-h-[100px] p-2 rounded-lg border-2 border-dashed border-slate-700"
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDrop={(e) => handleDrop(e, section.id)}
            >
              {section.exercises.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  {lang === 'en'
                    ? 'Drag exercises here or add from library'
                    : 'Arrastra ejercicios aquí o agrega desde la biblioteca'}
                </div>
              ) : (
                section.exercises.map((exercise, idx) => (
                  <div
                    key={exercise.id}
                    draggable
                    onDragStart={() => handleDragStart(exercise, section.id)}
                    className={`p-3 rounded-lg bg-slate-900/60 border-2 cursor-move transition-all ${
                      selectedExerciseId === exercise.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => onSelectExercise(exercise, section.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <GripVertical className="w-4 h-4 text-slate-400 mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-50">{exercise.name}</h4>
                            {exercise.isOptional && (
                              <Badge variant="outline" className="text-xs">
                                {lang === 'en' ? 'Optional' : 'Opcional'}
                              </Badge>
                            )}
                            {exercise.groupType && exercise.groupType !== 'NONE' && (
                              <Badge variant="secondary" className="text-xs">
                                {exercise.groupType}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 space-y-1">
                            {exercise.sets > 0 && (
                              <div>
                                {exercise.sets} {lang === 'en' ? 'sets' : 'series'} ×{' '}
                                {exercise.reps
                                  ? `${exercise.reps} ${lang === 'en' ? 'reps' : 'repeticiones'}`
                                  : exercise.timeSeconds
                                  ? `${exercise.timeSeconds}s`
                                  : exercise.distance
                                  ? `${exercise.distance}m`
                                  : ''}
                              </div>
                            )}
                            {exercise.restSeconds && (
                              <div>
                                {lang === 'en' ? 'Rest' : 'Descanso'}: {exercise.restSeconds}s
                              </div>
                            )}
                            {exercise.loadType && exercise.loadValue && (
                              <div>
                                {exercise.loadType === 'WEIGHT' && `${exercise.loadValue}kg`}
                                {exercise.loadType === 'RPE' && `RPE ${exercise.loadValue}`}
                                {exercise.loadType === 'PERCENT' && `${exercise.loadValue}% 1RM`}
                                {exercise.loadType === 'BODYWEIGHT' && lang === 'en' ? 'Bodyweight' : 'Peso Corporal'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectExercise(exercise, section.id);
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveExercise(section.id, exercise.id);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

