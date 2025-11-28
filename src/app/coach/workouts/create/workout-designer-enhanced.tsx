'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  X,
  Search,
  Filter,
  Settings,
  ChevronDown,
  ChevronUp,
  Play,
  Video,
  Star,
  Dumbbell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { translations, Lang } from '@/lib/i18n';
import { createWorkout } from './actions';
import { updateWorkoutStructure } from '../[workoutId]/update-actions';
import ExerciseLibraryPanel from './exercise-library-panel';
import WorkoutBuilderPanel from './workout-builder-panel';
import ExerciseConfigPanel from './exercise-config-panel';

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

export default function WorkoutDesignerEnhanced({ 
  coachId, 
  lang,
  workoutId,
  initialData,
  mode = 'create'
}: { 
  coachId: string; 
  lang: Lang;
  workoutId?: string;
  initialData?: any;
  mode?: 'create' | 'edit';
}) {
  const router = useRouter();
  const t = translations.coach[lang] || translations.coach.en;
  const [saving, setSaving] = useState(false);

  // Workout metadata
  const [workoutName, setWorkoutName] = useState(initialData?.name || '');
  const [tagline, setTagline] = useState(initialData?.description || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [workoutType, setWorkoutType] = useState(initialData?.primaryBodyFocus || '');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || '');
  const [goalTags, setGoalTags] = useState<string[]>(initialData?.tags?.filter((t: string) => ['STRENGTH', 'HYPERTROPHY', 'ENDURANCE', 'FAT_LOSS', 'MOBILITY'].includes(t)) || []);
  const [contextTags, setContextTags] = useState<string[]>(initialData?.tags?.filter((t: string) => !['STRENGTH', 'HYPERTROPHY', 'ENDURANCE', 'FAT_LOSS', 'MOBILITY'].includes(t)) || []);
  const [estimatedDuration, setEstimatedDuration] = useState(initialData?.estimatedDuration || 30);
  const [visibility, setVisibility] = useState<'PRIVATE' | 'TEAM' | 'PUBLIC'>((initialData?.visibility as any) || 'PRIVATE');

  // Workout structure
  const [sections, setSections] = useState<WorkoutSection[]>(
    initialData?.sections?.map((s: any) => ({
      id: s.id || `section-${Date.now()}`,
      name: s.name,
      type: s.name.toLowerCase().includes('warm') ? 'WARMUP' : s.name.toLowerCase().includes('finish') ? 'FINISHER' : 'MAIN',
      order: s.order,
      notes: s.notes,
      exercises: s.blocks?.[0]?.exercises?.map((e: any) => ({
        id: e.id || `ex-${Date.now()}`,
        exerciseId: e.exerciseId,
        name: e.name,
        category: e.category,
        equipment: e.equipment,
        musclesTargeted: e.musclesTargeted || [],
        notes: e.notes,
        coachNotes: e.coachNotes,
        sets: Array.isArray(e.targetRepsBySet) ? e.targetRepsBySet.length : 3,
        reps: Array.isArray(e.targetRepsBySet) ? e.targetRepsBySet[0] : 10,
        restSeconds: Array.isArray(e.targetRestBySet) ? e.targetRestBySet[0] : 60,
        targetRepsBySet: Array.isArray(e.targetRepsBySet) ? e.targetRepsBySet : [10, 10, 10],
        targetWeightBySet: Array.isArray(e.targetWeightBySet) ? e.targetWeightBySet : [null, null, null],
        targetRestBySet: Array.isArray(e.targetRestBySet) ? e.targetRestBySet : [60, 60, 60],
        order: e.order,
      })) || [],
    })) || [
      {
        id: 'warmup',
        name: lang === 'en' ? 'Warm-up' : 'Calentamiento',
        type: 'WARMUP',
        order: 0,
        exercises: [],
      },
      {
        id: 'main',
        name: lang === 'en' ? 'Main Workout' : 'Entrenamiento Principal',
        type: 'MAIN',
        order: 1,
        exercises: [],
      },
      {
        id: 'finisher',
        name: lang === 'en' ? 'Finisher' : 'Finalización',
        type: 'FINISHER',
        order: 2,
        exercises: [],
      },
    ]
  );

  // Exercise Library state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    modality: '',
    bodyRegion: '',
    movementPattern: '',
    muscles: [] as string[],
    equipment: [] as string[],
    difficulty: '',
    environment: '',
    coachOnly: false,
    globalOnly: false,
    favorites: false,
  });
  const [sortBy, setSortBy] = useState('recommended');
  const [showFilters, setShowFilters] = useState(false);

  // Exercise Configuration state
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null); // For adding exercises to specific section
  
  // Swap mode state
  const [swapMode, setSwapMode] = useState(false);
  const [swapTargetExerciseId, setSwapTargetExerciseId] = useState<string | null>(null);
  const [swapTargetSectionId, setSwapTargetSectionId] = useState<string | null>(null);

  // Fetch exercises
  const fetchExercises = useCallback(async () => {
    setLoadingExercises(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.modality) params.append('modality', filters.modality);
      if (filters.bodyRegion) params.append('bodyRegion', filters.bodyRegion);
      if (filters.movementPattern) params.append('movementPattern', filters.movementPattern);
      filters.muscles.forEach(m => params.append('muscles', m));
      filters.equipment.forEach(e => params.append('equipment', e));
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.environment) params.append('environment', filters.environment);
      if (filters.coachOnly) params.append('coachOnly', 'true');
      if (filters.globalOnly) params.append('globalOnly', 'true');
      if (filters.favorites) params.append('favorites', 'true');
      params.append('sortBy', sortBy);

      const res = await fetch(`/api/exercises?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExercises(data.exercises || []);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoadingExercises(false);
    }
  }, [searchQuery, filters, sortBy]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Add exercise to workout
  const handleAddExercise = (exercise: Exercise, sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newExercise: WorkoutExercise = {
      id: `ex-${Date.now()}`,
      exerciseId: exercise.id,
      exercise,
      name: exercise.name,
      category: exercise.category,
      equipment: exercise.equipment,
      musclesTargeted: exercise.musclesTargeted || [],
      sets: exercise.sets || 3,
      reps: exercise.reps || 10,
      restSeconds: exercise.restSeconds || 60,
      targetRepsBySet: exercise.reps ? Array(exercise.sets || 3).fill(exercise.reps) : [10, 10, 10],
      targetWeightBySet: [null, null, null],
      targetRestBySet: Array(exercise.sets || 3).fill(exercise.restSeconds || 60),
      loadType: 'WEIGHT',
      order: section.exercises.length,
    };

    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, exercises: [...s.exercises, newExercise] }
        : s
    ));

    // Auto-select the new exercise for configuration
    setSelectedExercise(newExercise);
    setSelectedSectionId(sectionId);
  };

  // Update exercise configuration
  const handleUpdateExercise = (updatedExercise: WorkoutExercise) => {
    if (!selectedSectionId) return;

    setSections(sections.map(s =>
      s.id === selectedSectionId
        ? {
            ...s,
            exercises: s.exercises.map(e =>
              e.id === updatedExercise.id ? updatedExercise : e
            ),
          }
        : s
    ));

    setSelectedExercise(updatedExercise);
  };

  // Remove exercise
  const handleRemoveExercise = (sectionId: string, exerciseId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, exercises: s.exercises.filter(e => e.id !== exerciseId) }
        : s
    ));

    if (selectedExercise?.id === exerciseId) {
      setSelectedExercise(null);
      setSelectedSectionId(null);
    }
  };

  // Swap exercise with one from library
  const handleSwapExercise = () => {
    if (!selectedExercise || !selectedSectionId) return;
    
    // Clear selection to show library, user can click an exercise to swap
    setSelectedExercise(null);
    setSelectedSectionId(null);
    // Set a flag that we're in swap mode
    setSwapMode(true);
    setSwapTargetExerciseId(selectedExercise.id);
    setSwapTargetSectionId(selectedSectionId);
  };

  // Handle exercise selection (normal add or swap)
  const handleExerciseSelect = (exercise: Exercise) => {
    if (swapMode && swapTargetExerciseId && swapTargetSectionId) {
      // Swap mode: replace the target exercise
      const section = sections.find(s => s.id === swapTargetSectionId);
      if (!section) return;

      const oldExercise = section.exercises.find(e => e.id === swapTargetExerciseId);
      if (!oldExercise) return;

      const newExercise: WorkoutExercise = {
        ...oldExercise,
        id: oldExercise.id, // Keep same ID
        exerciseId: exercise.id,
        exercise,
        name: exercise.name,
        category: exercise.category || oldExercise.category,
        equipment: exercise.equipment || oldExercise.equipment,
        musclesTargeted: exercise.musclesTargeted || oldExercise.musclesTargeted,
      };

      setSections(sections.map(s =>
        s.id === swapTargetSectionId
          ? {
              ...s,
              exercises: s.exercises.map(e =>
                e.id === swapTargetExerciseId ? newExercise : e
              ),
            }
          : s
      ));

      // Select the swapped exercise
      setSelectedExercise(newExercise);
      setSelectedSectionId(swapTargetSectionId);
      
      // Clear swap mode
      setSwapMode(false);
      setSwapTargetExerciseId(null);
      setSwapTargetSectionId(null);
    } else {
      // Normal add mode
      const targetSection = targetSectionId 
        ? sections.find(s => s.id === targetSectionId)
        : sections.find(s => s.type === 'MAIN') || sections[0];
      if (targetSection) {
        handleAddExercise(exercise, targetSection.id);
      }
    }
  };

  // Calculate estimated duration
  const calculateDuration = () => {
    let totalSeconds = 0;
    sections.forEach(section => {
      section.exercises.forEach(ex => {
        if (ex.timeSeconds) {
          totalSeconds += ex.timeSeconds * ex.sets;
        } else if (ex.reps) {
          // Estimate: 2 seconds per rep + rest
          const timePerSet = (ex.reps * 2) + (ex.restSeconds || 60);
          totalSeconds += timePerSet * ex.sets;
        }
      });
    });
    return Math.ceil(totalSeconds / 60); // Convert to minutes
  };

  useEffect(() => {
    const duration = calculateDuration();
    if (duration > 0) {
      setEstimatedDuration(duration);
    }
  }, [sections]);

  // Save workout
  const handleSave = async () => {
    if (!workoutName.trim()) {
      alert(lang === 'en' ? 'Workout name is required' : 'El nombre del entrenamiento es requerido');
      return;
    }

    // Filter out sections with no exercises
    const sectionsWithExercises = sections.filter(s => s.exercises.length > 0);
    
    if (sectionsWithExercises.length === 0) {
      alert(lang === 'en' 
        ? 'Please add at least one exercise to your workout before saving.' 
        : 'Por favor agrega al menos un ejercicio a tu entrenamiento antes de guardar.');
      return;
    }

    const mainSection = sectionsWithExercises.find(s => s.type === 'MAIN');
    if (!mainSection || mainSection.exercises.length === 0) {
      alert(lang === 'en' 
        ? 'Main section must contain at least one exercise' 
        : 'La sección principal debe contener al menos un ejercicio');
      return;
    }

    setSaving(true);
    try {
      // Filter and validate exercises
      const validSections = sectionsWithExercises
        .map(s => ({
          name: s.name.trim() || 'Section',
          order: s.order,
          notes: s.notes?.trim() || undefined,
          blocks: [{
            type: 'STANDARD_SETS_REPS' as const,
            title: undefined,
            instructions: undefined,
            rounds: undefined,
            restBetweenRounds: undefined,
            estimatedTime: undefined,
            order: 0,
            exercises: s.exercises
              .filter(e => e.name.trim() && e.targetRepsBySet && e.targetRepsBySet.length > 0)
              .map((e, idx) => ({
                name: e.name.trim(),
                category: e.category || undefined,
                equipment: e.equipment || undefined,
                notes: e.notes || undefined,
                coachNotes: e.coachNotes || undefined,
                targetRepsBySet: e.targetRepsBySet.filter(r => r > 0),
                targetWeightBySet: e.targetWeightBySet && e.targetWeightBySet.length > 0 
                  ? e.targetWeightBySet 
                  : undefined,
                targetRestBySet: e.targetRestBySet && e.targetRestBySet.length > 0
                  ? e.targetRestBySet
                  : undefined,
                order: idx,
              })),
          }].filter(b => b.exercises.length > 0),
        }))
        .filter(s => s.blocks.length > 0)
        .map((s, idx) => ({ ...s, order: idx }));

      if (validSections.length === 0) {
        alert(lang === 'en' 
          ? 'Please add at least one valid exercise to your workout before saving.' 
          : 'Por favor agrega al menos un ejercicio válido a tu entrenamiento antes de guardar.');
        setSaving(false);
        return;
      }

      const workoutData = {
        name: workoutName.trim(),
        description: (tagline || description)?.trim() || undefined,
        goal: goalTags[0] || undefined,
        difficulty: difficulty || undefined,
        trainingEnvironment: filters.environment || undefined,
        primaryBodyFocus: workoutType || undefined,
        estimatedDuration,
        sessionTypes: [],
        tags: [...goalTags, ...contextTags].length > 0 ? [...goalTags, ...contextTags] : undefined,
        visibility,
        sections: validSections,
      };

      console.log('Saving workout:', {
        name: workoutName,
        sectionsCount: validSections.length,
        totalExercises: validSections.reduce((sum, s) => 
          sum + s.blocks.reduce((blockSum, b) => blockSum + b.exercises.length, 0), 0
        ),
      });
      console.log('Workout data to save:', JSON.stringify(workoutData, null, 2));

      if (mode === 'edit' && workoutId) {
        const result = await updateWorkoutStructure(workoutId, workoutData);
        if (result.success) {
          router.push(`/coach/workouts/${workoutId}`);
        } else {
          console.error('Update failed:', result.error);
          alert(result.error || (lang === 'en' ? 'Failed to update workout' : 'Error al actualizar entrenamiento'));
        }
      } else {
        console.log('About to call createWorkout...');
        try {
          const result = await createWorkout(workoutData);
          console.log('createWorkout result:', result);
          if (result.success) {
            router.push(`/coach/workouts/${result.workoutId}`);
          } else {
            console.error('Save failed:', result.error);
            alert(result.error || (lang === 'en' ? 'Failed to save workout' : 'Error al guardar entrenamiento'));
          }
        } catch (err) {
          console.error('Error calling createWorkout:', err);
          throw err;
        }
      }
    } catch (error: any) {
      console.error('Error saving workout:', error);
      alert(lang === 'en' 
        ? `An error occurred: ${error.message || 'Unknown error'}` 
        : `Ocurrió un error: ${error.message || 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Bar - Workout Metadata */}
      <div className="border-b border-slate-800 bg-slate-900/50 p-3 sm:p-4 sticky top-0 z-40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 w-full sm:w-auto min-w-0">
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link href="/coach/workouts">
                <ArrowLeft className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">{t.back || 'Back'}</span>
              </Link>
            </Button>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder={lang === 'en' ? 'Workout Name' : 'Nombre del Entrenamiento'}
              className="text-lg sm:text-xl font-bold bg-transparent border-none outline-none text-slate-50 placeholder:text-slate-500 flex-1 min-w-0"
              maxLength={80}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start flex-wrap">
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              className="px-2 sm:px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-xs sm:text-sm"
            >
              <option value="">{lang === 'en' ? 'Type' : 'Tipo'}</option>
              <option value="FULL_BODY">{lang === 'en' ? 'Full Body' : 'Cuerpo Completo'}</option>
              <option value="UPPER">{lang === 'en' ? 'Upper' : 'Superior'}</option>
              <option value="LOWER">{lang === 'en' ? 'Lower' : 'Inferior'}</option>
              <option value="PUSH">{lang === 'en' ? 'Push' : 'Empuje'}</option>
              <option value="PULL">{lang === 'en' ? 'Pull' : 'Tirón'}</option>
              <option value="CORE">{lang === 'en' ? 'Core' : 'Core'}</option>
              <option value="CARDIO">{lang === 'en' ? 'Cardio' : 'Cardio'}</option>
              <option value="MOBILITY">{lang === 'en' ? 'Mobility' : 'Movilidad'}</option>
            </select>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-2 sm:px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-xs sm:text-sm"
            >
              <option value="">{lang === 'en' ? 'Difficulty' : 'Dificultad'}</option>
              <option value="BEGINNER">{lang === 'en' ? 'Beginner' : 'Principiante'}</option>
              <option value="INTERMEDIATE">{lang === 'en' ? 'Intermediate' : 'Intermedio'}</option>
              <option value="ADVANCED">{lang === 'en' ? 'Advanced' : 'Avanzado'}</option>
            </select>
            <div className="text-xs sm:text-sm text-slate-400 hidden sm:block">
              ~{estimatedDuration} {lang === 'en' ? 'min' : 'min'}
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm" className="shrink-0">
              <Save className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{saving ? (lang === 'en' ? 'Saving...' : 'Guardando...') : (lang === 'en' ? 'Save' : 'Guardar')}</span>
              <span className="sm:hidden">{saving ? '...' : '✓'}</span>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as any)}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-50 text-xs"
          >
            <option value="PRIVATE">{lang === 'en' ? 'Private' : 'Privado'}</option>
            <option value="TEAM">{lang === 'en' ? 'Team' : 'Equipo'}</option>
            <option value="PUBLIC">{lang === 'en' ? 'Public' : 'Público'}</option>
          </select>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder={lang === 'en' ? 'Add tagline...' : 'Agregar eslogan...'}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-50 text-xs flex-1 min-w-0 max-w-xs"
            maxLength={120}
          />
          <div className="flex gap-1 flex-wrap">
            {goalTags.map(tag => (
              <Badge key={tag} variant="default" className="text-xs cursor-pointer" onClick={() => setGoalTags(goalTags.filter(t => t !== tag))}>
                {tag} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {contextTags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs cursor-pointer" onClick={() => setContextTags(contextTags.filter(t => t !== tag))}>
                {tag} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const tag = prompt(lang === 'en' ? 'Add goal tag (e.g., Strength, Fat Loss)' : 'Agregar etiqueta de objetivo (ej., Fuerza, Pérdida de Grasa)');
              if (tag) setGoalTags([...goalTags, tag]);
            }}
            className="hidden sm:flex"
          >
            <Plus className="w-3 h-3 mr-1" />
            {lang === 'en' ? 'Goal Tag' : 'Etiqueta Objetivo'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const tag = prompt(lang === 'en' ? 'Add context tag (e.g., Home-friendly, Beginner)' : 'Agregar etiqueta de contexto (ej., Para Casa, Principiante)');
              if (tag) setContextTags([...contextTags, tag]);
            }}
            className="hidden sm:flex"
          >
            <Plus className="w-3 h-3 mr-1" />
            {lang === 'en' ? 'Context Tag' : 'Etiqueta Contexto'}
          </Button>
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANEL - Exercise Library */}
        <div className="w-full lg:w-80 border-r-0 lg:border-r border-slate-800 bg-slate-900/30 overflow-y-auto max-h-[40vh] lg:max-h-none">
          <ExerciseLibraryPanel
            exercises={exercises}
            loading={loadingExercises}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onAddExercise={handleExerciseSelect}
            targetSectionId={targetSectionId}
            onTargetSectionChange={setTargetSectionId}
            swapMode={swapMode}
            lang={lang}
          />
        </div>

        {/* CENTER PANEL - Workout Builder */}
        <div className="flex-1 overflow-y-auto bg-slate-950/50 min-h-[40vh] lg:min-h-0">
          <WorkoutBuilderPanel
            sections={sections}
            onSectionsChange={setSections}
            onAddExercise={(exercise, sectionId) => {
              if (swapMode && swapTargetExerciseId && swapTargetSectionId) {
                handleExerciseSelect(exercise);
              } else {
                handleAddExercise(exercise, sectionId);
              }
            }}
            onRemoveExercise={handleRemoveExercise}
            onSelectExercise={(exercise, sectionId) => {
              setSelectedExercise(exercise);
              setSelectedSectionId(sectionId);
            }}
            onSelectSection={(sectionId) => {
              setTargetSectionId(sectionId);
            }}
            selectedExerciseId={selectedExercise?.id}
            selectedSectionId={targetSectionId}
            lang={lang}
          />
        </div>

        {/* RIGHT PANEL - Exercise Configuration */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/30 overflow-y-auto max-h-[40vh] lg:max-h-none">
          {selectedExercise ? (
            <ExerciseConfigPanel
              exercise={selectedExercise}
              onUpdate={handleUpdateExercise}
              onClose={() => {
                setSelectedExercise(null);
                setSelectedSectionId(null);
                setSwapMode(false);
                setSwapTargetExerciseId(null);
                setSwapTargetSectionId(null);
              }}
              onSwap={handleSwapExercise}
              lang={lang}
            />
          ) : (
            <div className="p-6 text-center text-slate-400">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {lang === 'en'
                  ? 'Select an exercise to configure sets, reps, rest, and notes'
                  : 'Selecciona un ejercicio para configurar series, repeticiones, descanso y notas'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

