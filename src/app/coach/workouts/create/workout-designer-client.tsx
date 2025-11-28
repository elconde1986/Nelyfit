'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  X,
  Dumbbell,
  Settings,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';
import { createWorkout } from './actions';
import ExerciseLibraryModal from '@/components/ExerciseLibraryModal';

type WorkoutSection = {
  id: string;
  name: string;
  order: number;
  notes?: string;
  blocks: WorkoutBlock[];
};

type WorkoutBlock = {
  id: string;
  type: string;
  title?: string;
  instructions?: string;
  rounds?: number;
  restBetweenRounds?: number;
  estimatedTime?: number;
  order: number;
  exercises: WorkoutExercise[];
};

type WorkoutExercise = {
  id: string;
  name: string;
  category?: string;
  equipment?: string;
  notes?: string;
  coachNotes?: string;
  targetRepsBySet: number[];
  targetWeightBySet?: (number | null)[];
  targetRestBySet?: number[];
  order: number;
};

export default function WorkoutDesignerClient({ coachId, lang }: { coachId: string; lang: Lang }) {
  const router = useRouter();
  const t = translations.coach[lang] || translations.coach.en;
  const [saving, setSaving] = useState(false);
  
  // Workout metadata
  const [workoutName, setWorkoutName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('');
  const [primaryBodyFocus, setPrimaryBodyFocus] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [sessionTypes, setSessionTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'PRIVATE' | 'TEAM' | 'PUBLIC'>('PRIVATE');
  const [tagInput, setTagInput] = useState('');

  // Exercise Library Modal state
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Workout structure
  const [sections, setSections] = useState<WorkoutSection[]>([
    {
      id: '1',
      name: lang === 'en' ? 'Warm-up' : 'Calentamiento',
      order: 0,
      blocks: [],
    },
    {
      id: '2',
      name: lang === 'en' ? 'Main Workout' : 'Entrenamiento Principal',
      order: 1,
      blocks: [],
    },
    {
      id: '3',
      name: lang === 'en' ? 'Cool-down' : 'Enfriamiento',
      order: 2,
      blocks: [],
    },
  ]);

  const addSection = () => {
    const newSection: WorkoutSection = {
      id: Date.now().toString(),
      name: lang === 'en' ? 'New Section' : 'Nueva Sección',
      order: sections.length,
      blocks: [],
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter(s => s.id !== sectionId).map((s, idx) => ({ ...s, order: idx })));
  };

  const updateSectionName = (sectionId: string, name: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, name } : s));
  };

  const addBlock = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newBlock: WorkoutBlock = {
      id: Date.now().toString(),
      type: 'STANDARD_SETS_REPS',
      title: lang === 'en' ? 'Block A' : 'Bloque A',
      order: section.blocks.length,
      exercises: [],
    };

    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, blocks: [...s.blocks, newBlock] }
        : s
    ));
  };

  const removeBlock = (sectionId: string, blockId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? { ...s, blocks: s.blocks.filter(b => b.id !== blockId).map((b, idx) => ({ ...b, order: idx })) }
        : s
    ));
  };

  const addExercise = (sectionId: string, blockId: string) => {
    // Open exercise library modal
    setSelectedSectionId(sectionId);
    setSelectedBlockId(blockId);
    setIsExerciseModalOpen(true);
  };

  const handleExerciseSelect = (exercise: any) => {
    if (!selectedSectionId || !selectedBlockId) return;

    // Create WorkoutExercise from library exercise
    const defaultReps = exercise.reps || 8;
    const defaultSets = exercise.sets || 3;
    const repsArray = Array(defaultSets).fill(defaultReps);

    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      name: exercise.name,
      category: exercise.modality || exercise.category,
      equipment: exercise.equipmentDetail || exercise.equipmentCategory || exercise.equipment,
      notes: exercise.notes || undefined,
      targetRepsBySet: repsArray,
      targetWeightBySet: exercise.weight ? Array(defaultSets).fill(exercise.weight) : undefined,
      targetRestBySet: exercise.restSeconds ? Array(defaultSets).fill(exercise.restSeconds) : undefined,
      order: 0,
    };

    // Find the block and add exercise
    const section = sections.find(s => s.id === selectedSectionId);
    if (section) {
      const block = section.blocks.find(b => b.id === selectedBlockId);
      if (block) {
        newExercise.order = block.exercises.length;
      }
    }

    setSections(sections.map(s =>
      s.id === selectedSectionId
        ? {
            ...s,
            blocks: s.blocks.map(b =>
              b.id === selectedBlockId
                ? { ...b, exercises: [...b.exercises, newExercise] }
                : b
            ),
          }
        : s
    ));

    // Reset modal state
    setIsExerciseModalOpen(false);
    setSelectedSectionId(null);
    setSelectedBlockId(null);
  };

  const removeExercise = (sectionId: string, blockId: string, exerciseId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            blocks: s.blocks.map(b =>
              b.id === blockId
                ? { ...b, exercises: b.exercises.filter(e => e.id !== exerciseId) }
                : b
            ),
          }
        : s
    ));
  };

  const updateExercise = (
    sectionId: string,
    blockId: string,
    exerciseId: string,
    updates: Partial<WorkoutExercise>
  ) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            blocks: s.blocks.map(b =>
              b.id === blockId
                ? {
                    ...b,
                    exercises: b.exercises.map(e =>
                      e.id === exerciseId ? { ...e, ...updates } : e
                    ),
                  }
                : b
            ),
          }
        : s
    ));
  };

  const addSetToExercise = (sectionId: string, blockId: string, exerciseId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            blocks: s.blocks.map(b =>
              b.id === blockId
                ? {
                    ...b,
                    exercises: b.exercises.map(e =>
                      e.id === exerciseId
                        ? {
                            ...e,
                            targetRepsBySet: [...e.targetRepsBySet, 8],
                            targetWeightBySet: [...(e.targetWeightBySet || []), null],
                          }
                        : e
                    ),
                  }
                : b
            ),
          }
        : s
    ));
  };

  const removeSetFromExercise = (sectionId: string, blockId: string, exerciseId: string, setIndex: number) => {
    setSections(sections.map(s =>
      s.id === sectionId
        ? {
            ...s,
            blocks: s.blocks.map(b =>
              b.id === blockId
                ? {
                    ...b,
                    exercises: b.exercises.map(e =>
                      e.id === exerciseId
                        ? {
                            ...e,
                            targetRepsBySet: e.targetRepsBySet.filter((_, i) => i !== setIndex),
                            targetWeightBySet: e.targetWeightBySet?.filter((_, i) => i !== setIndex),
                          }
                        : e
                    ),
                  }
                : b
            ),
          }
        : s
    ));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!workoutName.trim()) {
      alert(lang === 'en' ? 'Workout name is required' : 'El nombre del entrenamiento es requerido');
      return;
    }

    setSaving(true);
    try {
      const result = await createWorkout({
        name: workoutName,
        description,
        goal: goal || undefined,
        difficulty: difficulty || undefined,
        trainingEnvironment: environment || undefined,
        primaryBodyFocus: primaryBodyFocus || undefined,
        estimatedDuration,
        sessionTypes,
        tags,
        visibility,
        sections: sections.map(s => ({
          name: s.name,
          order: s.order,
          notes: s.notes,
          blocks: s.blocks.map(b => ({
            type: b.type,
            title: b.title,
            instructions: b.instructions,
            rounds: b.rounds,
            restBetweenRounds: b.restBetweenRounds,
            estimatedTime: b.estimatedTime,
            order: b.order,
            exercises: b.exercises.map(e => ({
              name: e.name,
              category: e.category,
              equipment: e.equipment,
              notes: e.notes,
              coachNotes: e.coachNotes,
              targetRepsBySet: e.targetRepsBySet,
              targetWeightBySet: e.targetWeightBySet,
              targetRestBySet: e.targetRestBySet,
              order: e.order,
            })),
          })),
        })),
      });

      if (result.success) {
        router.push(`/coach/workouts/${result.workoutId}`);
      } else {
        alert(result.error || (lang === 'en' ? 'Failed to save workout' : 'Error al guardar entrenamiento'));
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      alert(lang === 'en' ? 'An error occurred' : 'Ocurrió un error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Workout Structure */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">{t.newWorkout}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {lang === 'en' ? 'Build your structured workout' : 'Construye tu entrenamiento estructurado'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/coach/workouts">
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t.back || 'Back'}
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="w-4 h-4 mr-1" />
              {saving ? (lang === 'en' ? 'Saving...' : 'Guardando...') : (lang === 'en' ? 'Save' : 'Guardar')}
            </Button>
          </div>
        </div>

        {/* Workout Name */}
        <Card>
          <CardContent className="p-4">
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder={lang === 'en' ? 'Workout Name' : 'Nombre del Entrenamiento'}
              className="w-full text-xl font-bold bg-transparent border-none outline-none text-slate-50 placeholder:text-slate-500"
              maxLength={80}
            />
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, sectionIdx) => (
            <Card key={section.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => updateSectionName(section.id, e.target.value)}
                    className="text-lg font-bold bg-transparent border-none outline-none text-slate-50 flex-1"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addBlock(section.id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {lang === 'en' ? 'Add Block' : 'Agregar Bloque'}
                    </Button>
                    {sections.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(section.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.blocks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">
                      {lang === 'en' ? 'No blocks yet. Add a block to start.' : 'Aún no hay bloques. Agrega un bloque para comenzar.'}
                    </p>
                  </div>
                ) : (
                  section.blocks.map((block) => (
                    <div key={block.id} className="border border-slate-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => {
                            setSections(sections.map(s =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    blocks: s.blocks.map(b =>
                                      b.id === block.id ? { ...b, title: e.target.value } : b
                                    ),
                                  }
                                : s
                            ));
                          }}
                          placeholder={lang === 'en' ? 'Block Title' : 'Título del Bloque'}
                          className="font-semibold bg-transparent border-none outline-none text-slate-50 flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBlock(section.id, block.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Exercises in Block */}
                      <div className="space-y-3">
                        {block.exercises.length === 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addExercise(section.id, block.id)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            {lang === 'en' ? 'Add Exercise' : 'Agregar Ejercicio'}
                          </Button>
                        ) : (
                          block.exercises.map((exercise) => (
                            <div key={exercise.id} className="bg-slate-900/60 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <input
                                  type="text"
                                  value={exercise.name}
                                  onChange={(e) => updateExercise(section.id, block.id, exercise.id, { name: e.target.value })}
                                  placeholder={lang === 'en' ? 'Exercise Name' : 'Nombre del Ejercicio'}
                                  className="font-semibold bg-transparent border-none outline-none text-slate-50 flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExercise(section.id, block.id, exercise.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Per-Set Programming Table */}
                              {block.type === 'STANDARD_SETS_REPS' && (
                                <div className="mt-3">
                                  <div className="text-xs text-slate-400 mb-2">
                                    {lang === 'en' ? 'Sets' : 'Series'}
                                  </div>
                                  <div className="space-y-2">
                                    {exercise.targetRepsBySet.map((reps, setIdx) => (
                                      <div key={setIdx} className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 w-8">Set {setIdx + 1}</span>
                                        <input
                                          type="number"
                                          value={reps}
                                          onChange={(e) => {
                                            const newReps = [...exercise.targetRepsBySet];
                                            newReps[setIdx] = parseInt(e.target.value) || 0;
                                            updateExercise(section.id, block.id, exercise.id, { targetRepsBySet: newReps });
                                          }}
                                          className="w-20 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                                          placeholder="Reps"
                                        />
                                        <input
                                          type="number"
                                          value={exercise.targetWeightBySet?.[setIdx] || ''}
                                          onChange={(e) => {
                                            const newWeights = [...(exercise.targetWeightBySet || [])];
                                            newWeights[setIdx] = e.target.value ? parseFloat(e.target.value) : null;
                                            updateExercise(section.id, block.id, exercise.id, { targetWeightBySet: newWeights });
                                          }}
                                          className="w-20 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                                          placeholder={lang === 'en' ? 'Weight' : 'Peso'}
                                        />
                                        <span className="text-xs text-slate-400">kg</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeSetFromExercise(section.id, block.id, exercise.id, setIdx)}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => addSetToExercise(section.id, block.id, exercise.id)}
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      {lang === 'en' ? 'Add Set' : 'Agregar Serie'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addExercise(section.id, block.id)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {lang === 'en' ? 'Add Exercise' : 'Agregar Ejercicio'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="ghost" onClick={addSection} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          {lang === 'en' ? 'Add Section' : 'Agregar Sección'}
        </Button>
      </div>

      {/* Right Column - Metadata */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {lang === 'en' ? 'Workout Settings' : 'Configuración'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Description' : 'Descripción'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
                placeholder={lang === 'en' ? '1-3 sentences describing the session' : '1-3 oraciones describiendo la sesión'}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Primary Goal' : 'Objetivo Principal'}
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
              >
                <option value="">{lang === 'en' ? 'Select...' : 'Seleccionar...'}</option>
                <option value="STRENGTH">{lang === 'en' ? 'Strength' : 'Fuerza'}</option>
                <option value="HYPERTROPHY">{lang === 'en' ? 'Hypertrophy' : 'Hipertrofia'}</option>
                <option value="FAT_LOSS">{lang === 'en' ? 'Fat Loss' : 'Pérdida de Grasa'}</option>
                <option value="GENERAL_FITNESS">{lang === 'en' ? 'General Fitness' : 'Fitness General'}</option>
                <option value="ENDURANCE">{lang === 'en' ? 'Endurance' : 'Resistencia'}</option>
                <option value="MOBILITY">{lang === 'en' ? 'Mobility' : 'Movilidad'}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Difficulty' : 'Dificultad'}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
              >
                <option value="">{lang === 'en' ? 'Select...' : 'Seleccionar...'}</option>
                <option value="BEGINNER">{lang === 'en' ? 'Beginner' : 'Principiante'}</option>
                <option value="INTERMEDIATE">{lang === 'en' ? 'Intermediate' : 'Intermedio'}</option>
                <option value="ADVANCED">{lang === 'en' ? 'Advanced' : 'Avanzado'}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Training Environment' : 'Entorno de Entrenamiento'}
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
              >
                <option value="">{lang === 'en' ? 'Select...' : 'Seleccionar...'}</option>
                <option value="GYM">{lang === 'en' ? 'Gym' : 'Gimnasio'}</option>
                <option value="HOME">{lang === 'en' ? 'Home' : 'Casa'}</option>
                <option value="BODYWEIGHT">{lang === 'en' ? 'Bodyweight' : 'Peso Corporal'}</option>
                <option value="OUTDOOR">{lang === 'en' ? 'Outdoor' : 'Exterior'}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Estimated Duration' : 'Duración Estimada'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-slate-300 w-12">{estimatedDuration} min</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Visibility' : 'Visibilidad'}
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
              >
                <option value="PRIVATE">{lang === 'en' ? 'Private' : 'Privado'}</option>
                <option value="TEAM">{lang === 'en' ? 'Team' : 'Equipo'}</option>
                <option value="PUBLIC">{lang === 'en' ? 'Public' : 'Público'}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Tags' : 'Etiquetas'}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder={lang === 'en' ? 'Add tag...' : 'Agregar etiqueta...'}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
                />
                <Button onClick={handleAddTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="default" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Library Modal */}
      <ExerciseLibraryModal
        isOpen={isExerciseModalOpen}
        onClose={() => {
          setIsExerciseModalOpen(false);
          setSelectedSectionId(null);
          setSelectedBlockId(null);
        }}
        onSelect={handleExerciseSelect}
        lang={lang}
      />
    </div>
  );
}

