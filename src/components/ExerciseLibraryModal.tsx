'use client';

import { useState, useEffect } from 'react';
import { X, Search, Filter, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Exercise = {
  id: string;
  name: string;
  modality?: string | null;
  movementPattern?: string | null;
  primaryMuscles: string[];
  bodyRegion?: string | null;
  equipmentCategory?: string | null;
  equipmentDetail?: string | null;
  difficulty?: string | null;
  environment?: string | null;
  goalTags: string[];
  sets: number;
  reps?: number | null;
  durationSeconds?: number | null;
  restSeconds?: number | null;
  notes?: string | null;
};

type ExerciseLibraryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  lang: 'en' | 'es';
};

export default function ExerciseLibraryModal({
  isOpen,
  onClose,
  onSelect,
  lang,
}: ExerciseLibraryModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<string | null>(null);
  const [selectedBodyRegion, setSelectedBodyRegion] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recommended' | 'name'>('recommended');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen]);

  useEffect(() => {
    filterAndSortExercises();
  }, [exercises, searchQuery, selectedModality, selectedBodyRegion, selectedEquipment, selectedDifficulty, sortBy]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exercises?library=true');
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortExercises = () => {
    let filtered = [...exercises];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.primaryMuscles.some((m) => m.toLowerCase().includes(query)) ||
          ex.equipmentCategory?.toLowerCase().includes(query) ||
          ex.equipmentDetail?.toLowerCase().includes(query)
      );
    }

    // Modality filter
    if (selectedModality) {
      filtered = filtered.filter((ex) => ex.modality === selectedModality);
    }

    // Body region filter
    if (selectedBodyRegion) {
      filtered = filtered.filter((ex) => ex.bodyRegion === selectedBodyRegion);
    }

    // Equipment filter
    if (selectedEquipment) {
      filtered = filtered.filter(
        (ex) => ex.equipmentCategory === selectedEquipment || ex.equipmentDetail === selectedEquipment
      );
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter((ex) => ex.difficulty === selectedDifficulty);
    }

    // Sort
    if (sortBy === 'recommended') {
      // Beginner friendly + commonly used first
      filtered.sort((a, b) => {
        const aScore = (a.difficulty === 'beginner' ? 2 : a.difficulty === 'intermediate' ? 1 : 0) +
          (a.modality === 'strength' ? 1 : 0);
        const bScore = (b.difficulty === 'beginner' ? 2 : b.difficulty === 'intermediate' ? 1 : 0) +
          (b.modality === 'strength' ? 1 : 0);
        return bScore - aScore;
      });
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredExercises(filtered);
  };

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    onClose();
  };

  if (!isOpen) return null;

  const modalities = Array.from(new Set(exercises.map((e) => e.modality).filter((m): m is string => Boolean(m))));
  const bodyRegions = Array.from(new Set(exercises.map((e) => e.bodyRegion).filter((r): r is string => Boolean(r))));
  const equipmentTypes = Array.from(
    new Set(
      exercises
        .map((e) => e.equipmentCategory)
        .filter((e): e is string => Boolean(e))
        .concat(exercises.map((e) => e.equipmentDetail).filter((e): e is string => Boolean(e)))
    )
  );
  const difficulties = ['beginner', 'intermediate', 'advanced'] as const;

  const t = {
    en: {
      title: 'Exercise Library',
      search: 'Search by name, muscle, or equipment...',
      filters: 'Filters',
      modality: 'Modality',
      bodyRegion: 'Body Region',
      equipment: 'Equipment',
      difficulty: 'Difficulty',
      sortBy: 'Sort by',
      recommended: 'Recommended',
      name: 'Name (A-Z)',
      noResults: 'No exercises found',
      select: 'Select',
      loading: 'Loading exercises...',
      clearFilters: 'Clear Filters',
    },
    es: {
      title: 'Biblioteca de Ejercicios',
      search: 'Buscar por nombre, músculo o equipo...',
      filters: 'Filtros',
      modality: 'Modalidad',
      bodyRegion: 'Región del Cuerpo',
      equipment: 'Equipo',
      difficulty: 'Dificultad',
      sortBy: 'Ordenar por',
      recommended: 'Recomendado',
      name: 'Nombre (A-Z)',
      noResults: 'No se encontraron ejercicios',
      select: 'Seleccionar',
      loading: 'Cargando ejercicios...',
      clearFilters: 'Limpiar Filtros',
    },
  }[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col bg-slate-900 border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-slate-50">{t.title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 space-y-4 border-b border-slate-700">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-slate-50"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            {/* Modality */}
            <select
              value={selectedModality || ''}
              onChange={(e) => setSelectedModality(e.target.value || null)}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
            >
              <option value="">{t.modality}: All</option>
              {modalities.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Body Region */}
            <select
              value={selectedBodyRegion || ''}
              onChange={(e) => setSelectedBodyRegion(e.target.value || null)}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
            >
              <option value="">{t.bodyRegion}: All</option>
              {bodyRegions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* Equipment */}
            <select
              value={selectedEquipment || ''}
              onChange={(e) => setSelectedEquipment(e.target.value || null)}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
            >
              <option value="">{t.equipment}: All</option>
              {equipmentTypes.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              value={selectedDifficulty || ''}
              onChange={(e) => setSelectedDifficulty(e.target.value || null)}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
            >
              <option value="">{t.difficulty}: All</option>
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recommended' | 'name')}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
            >
              <option value="recommended">{t.recommended}</option>
              <option value="name">{t.name}</option>
            </select>

            {/* Clear Filters */}
            {(selectedModality || selectedBodyRegion || selectedEquipment || selectedDifficulty) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedModality(null);
                  setSelectedBodyRegion(null);
                  setSelectedEquipment(null);
                  setSelectedDifficulty(null);
                }}
              >
                {t.clearFilters}
              </Button>
            )}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-slate-400 py-12">{t.loading}</div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center text-slate-400 py-12">{t.noResults}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <Card
                  key={exercise.id}
                  className="p-4 bg-slate-800 border-slate-700 hover:border-emerald-500 cursor-pointer transition-colors"
                  onClick={() => handleSelect(exercise)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-slate-50">{exercise.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(exercise);
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {exercise.modality && (
                        <Badge variant="secondary" className="text-xs">
                          {exercise.modality}
                        </Badge>
                      )}
                      {exercise.difficulty && (
                        <Badge variant="secondary" className="text-xs">
                          {exercise.difficulty}
                        </Badge>
                      )}
                      {exercise.bodyRegion && (
                        <Badge variant="secondary" className="text-xs">
                          {exercise.bodyRegion}
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-slate-400">
                      {exercise.primaryMuscles.slice(0, 3).join(', ')}
                      {exercise.primaryMuscles.length > 3 && '...'}
                    </div>

                    <div className="text-xs text-slate-500">
                      {exercise.equipmentDetail || exercise.equipmentCategory || 'No equipment'}
                    </div>

                    {exercise.notes && (
                      <div className="text-xs text-slate-400 italic line-clamp-2">{exercise.notes}</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

