'use client';

import { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Plus, Video, Star, Dumbbell, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

type Filters = {
  modality: string;
  bodyRegion: string;
  movementPattern: string;
  muscles: string[];
  equipment: string[];
  difficulty: string;
  environment: string;
  coachOnly: boolean;
  globalOnly: boolean;
  favorites: boolean;
};

export default function ExerciseLibraryPanel({
  exercises,
  loading,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
  onAddExercise,
  targetSectionId,
  onTargetSectionChange,
  lang,
}: {
  exercises: Exercise[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onAddExercise: (exercise: Exercise) => void;
  targetSectionId?: string | null;
  onTargetSectionChange?: (sectionId: string | null) => void;
  lang: Lang;
}) {
  const [draggedLibraryExercise, setDraggedLibraryExercise] = useState<Exercise | null>(null);
  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'muscles' | 'equipment', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-lg">
            {lang === 'en' ? 'Exercise Library' : 'Biblioteca de Ejercicios'}
          </h2>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={lang === 'en' ? 'Search exercises...' : 'Buscar ejercicios...'}
            className="pl-10 bg-slate-900/60 border-slate-700"
          />
        </div>

        {/* Filter Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFilters}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {lang === 'en' ? 'Filters' : 'Filtros'}
          </span>
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 overflow-y-auto max-h-96">
          <div className="space-y-4">
            {/* Category */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                {lang === 'en' ? 'Category' : 'Categoría'}
              </label>
              <select
                value={filters.modality}
                onChange={(e) => updateFilter('modality', e.target.value)}
                className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-50 text-sm"
              >
                <option value="">{lang === 'en' ? 'All' : 'Todos'}</option>
                <option value="Strength">{lang === 'en' ? 'Strength' : 'Fuerza'}</option>
                <option value="Cardio">{lang === 'en' ? 'Cardio' : 'Cardio'}</option>
                <option value="Mobility">{lang === 'en' ? 'Mobility' : 'Movilidad'}</option>
                <option value="Stretch">{lang === 'en' ? 'Stretch' : 'Estiramiento'}</option>
                <option value="Core">{lang === 'en' ? 'Core' : 'Core'}</option>
              </select>
            </div>

            {/* Equipment */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">
                {lang === 'en' ? 'Equipment' : 'Equipamiento'}
              </label>
              <div className="space-y-1">
                {['Bodyweight', 'Dumbbell', 'Barbell', 'Machine', 'Cable', 'Kettlebell', 'Band', 'TRX'].map(eq => (
                  <label key={eq} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.equipment.includes(eq)}
                      onChange={() => toggleArrayFilter('equipment', eq)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500"
                    />
                    <span className="text-slate-300">{eq}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Coach Filters */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.coachOnly}
                  onChange={(e) => updateFilter('coachOnly', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span className="text-slate-300">{lang === 'en' ? 'My Exercises' : 'Mis Ejercicios'}</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.globalOnly}
                  onChange={(e) => updateFilter('globalOnly', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <span className="text-slate-300">{lang === 'en' ? 'Global Exercises' : 'Ejercicios Globales'}</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Sort */}
      <div className="p-4 border-b border-slate-800">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-50 text-sm"
        >
          <option value="recommended">{lang === 'en' ? 'Recommended' : 'Recomendado'}</option>
          <option value="alphabetical">{lang === 'en' ? 'A-Z' : 'A-Z'}</option>
          <option value="mostUsed">{lang === 'en' ? 'Most Used' : 'Más Usados'}</option>
          <option value="newest">{lang === 'en' ? 'Newest' : 'Más Recientes'}</option>
          <option value="difficultyAsc">{lang === 'en' ? 'Difficulty ↑' : 'Dificultad ↑'}</option>
          <option value="difficultyDesc">{lang === 'en' ? 'Difficulty ↓' : 'Dificultad ↓'}</option>
        </select>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-center text-slate-400 py-8">
            {lang === 'en' ? 'Loading exercises...' : 'Cargando ejercicios...'}
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            {lang === 'en' ? 'No exercises found' : 'No se encontraron ejercicios'}
          </div>
        ) : (
          exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="hover:border-emerald-500/50 transition-colors cursor-pointer"
              draggable
              onDragStart={(e) => {
                setDraggedLibraryExercise(exercise);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('application/json', JSON.stringify(exercise));
                e.dataTransfer.setData('text/plain', exercise.name);
              }}
              onDragEnd={() => {
                setDraggedLibraryExercise(null);
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate-50 truncate">
                      {exercise.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {exercise.category && (
                        <Badge variant="outline" className="text-xs">{exercise.category}</Badge>
                      )}
                      {exercise.coachVideos && exercise.coachVideos.length > 0 && (
                        <Video className="w-3 h-3 text-emerald-400" />
                      )}
                      {exercise.isLibraryExercise && (
                        <Badge variant="secondary" className="text-xs">
                          {lang === 'en' ? 'Global' : 'Global'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddExercise(exercise)}
                    className="shrink-0"
                    title={lang === 'en' ? 'Add to workout' : 'Agregar al entrenamiento'}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {exercise.musclesTargeted && exercise.musclesTargeted.length > 0 && (
                  <div className="text-xs text-slate-400 mt-2">
                    {exercise.musclesTargeted.slice(0, 3).join(', ')}
                  </div>
                )}
                {exercise.equipment && (
                  <div className="text-xs text-slate-400 mt-1">
                    {lang === 'en' ? 'Equipment' : 'Equipamiento'}: {exercise.equipment}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-2 italic">
                  {lang === 'en' ? 'Drag to section or click +' : 'Arrastra a sección o haz clic en +'}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

