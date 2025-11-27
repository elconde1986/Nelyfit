'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Copy,
  Archive,
  Eye,
  Save,
  X,
  User,
  Calendar,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Settings,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';
import { duplicateWorkout, archiveWorkout, updateWorkout } from './actions';

type Mode = 'view' | 'edit';

export default function WorkoutDetailClient({
  workout,
  coachId,
  canEdit,
  isOwner,
  isAdmin,
  isGlobal,
  lang,
  analytics,
}: {
  workout: any;
  coachId: string;
  canEdit: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isGlobal: boolean;
  lang: Lang;
  analytics: {
    timesUsed: number;
    timesCompleted: number;
    completionRate: number;
    totalSessions: number;
  };
}) {
  const router = useRouter();
  const t = translations.coach[lang] || translations.coach.en;
  const [mode, setMode] = useState<Mode>('view');
  const [clientPreview, setClientPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Edit state
  const [editData, setEditData] = useState({
    name: workout.name,
    description: workout.description || '',
    goal: workout.goal || '',
    difficulty: workout.difficulty || '',
    trainingEnvironment: workout.trainingEnvironment || '',
    primaryBodyFocus: workout.primaryBodyFocus || '',
    estimatedDuration: workout.estimatedDuration || 30,
    tags: workout.tags || [],
    visibility: workout.visibility || 'PRIVATE',
  });

  const handleDuplicate = async () => {
    setSaving(true);
    try {
      const result = await duplicateWorkout(workout.id);
      if (result.success) {
        router.push(`/coach/workouts/${result.workoutId}?mode=edit&duplicated=true`);
      }
    } catch (error) {
      console.error('Error duplicating workout:', error);
      alert(lang === 'en' ? 'Failed to duplicate workout' : 'Error al duplicar entrenamiento');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    setSaving(true);
    try {
      const result = await archiveWorkout(workout.id, !workout.archived);
      if (result.success) {
        router.refresh();
        setShowArchiveConfirm(false);
      }
    } catch (error) {
      console.error('Error archiving workout:', error);
      alert(lang === 'en' ? 'Failed to archive workout' : 'Error al archivar entrenamiento');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateWorkout(workout.id, editData);
      if (result.success) {
        setMode('view');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      alert(lang === 'en' ? 'Failed to save workout' : 'Error al guardar entrenamiento');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: workout.name,
      description: workout.description || '',
      goal: workout.goal || '',
      difficulty: workout.difficulty || '',
      trainingEnvironment: workout.trainingEnvironment || '',
      primaryBodyFocus: workout.primaryBodyFocus || '',
      estimatedDuration: workout.estimatedDuration || 30,
      tags: workout.tags || [],
      visibility: workout.visibility || 'PRIVATE',
    });
    setMode('view');
  };

  const isArchived = workout.tags?.includes('_archived') || false;

  const getStatusBadge = () => {
    if (isArchived) {
      return <Badge variant="warning">{lang === 'en' ? 'Archived' : 'Archivado'}</Badge>;
    }
    return <Badge variant="success">{lang === 'en' ? 'Active' : 'Activo'}</Badge>;
  };

  const getSourceLabel = () => {
    if (isGlobal) {
      return lang === 'en' ? 'Global Template' : 'Plantilla Global';
    }
    if (workout.visibility === 'TEAM') {
      return lang === 'en' ? 'Team' : 'Equipo';
    }
    return lang === 'en' ? 'Personal' : 'Personal';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/coach/workouts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Link>
            </Button>
            <div>
              {mode === 'view' ? (
                <h1 className="text-2xl sm:text-3xl font-bold">
                  <span className="gradient-text">{workout.name}</span>
                </h1>
              ) : (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="text-2xl sm:text-3xl font-bold bg-transparent border-none outline-none text-slate-50 w-full max-w-md"
                  placeholder={lang === 'en' ? 'Workout Name' : 'Nombre del Entrenamiento'}
                />
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {mode === 'view' ? (
              <>
                {canEdit && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setMode('edit')}
                      disabled={isArchived && !isAdmin}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {t.editWorkout}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDuplicate}
                      disabled={saving}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      {lang === 'en' ? 'Duplicate' : 'Duplicar'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowArchiveConfirm(true)}
                    >
                      {isArchived ? (
                        <>
                          <Archive className="w-4 h-4 mr-1" />
                          {lang === 'en' ? 'Unarchive' : 'Desarchivar'}
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4 mr-1" />
                          {lang === 'en' ? 'Archive' : 'Archivar'}
                        </>
                      )}
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setClientPreview(!clientPreview)}
                >
                  {clientPreview ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      {lang === 'en' ? 'Coach View' : 'Vista Entrenador'}
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      {lang === 'en' ? 'Preview as Client' : 'Vista Cliente'}
                    </>
                  )}
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link href={`/coach/workouts/${workout.id}/assign`}>
                    <Calendar className="w-4 h-4 mr-1" />
                    {lang === 'en' ? 'Assign' : 'Asignar'}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-1" />
                  {lang === 'en' ? 'Cancel' : 'Cancelar'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || !editData.name.trim()}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? (lang === 'en' ? 'Saving...' : 'Guardando...') : (lang === 'en' ? 'Save' : 'Guardar')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status & Metadata */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{lang === 'en' ? 'Status' : 'Estado'}</p>
                {getStatusBadge()}
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{lang === 'en' ? 'Created by' : 'Creado por'}</p>
                <p className="font-semibold">{workout.coach?.name || (lang === 'en' ? 'System' : 'Sistema')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{lang === 'en' ? 'Source' : 'Origen'}</p>
                <p className="font-semibold">{getSourceLabel()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        {mode === 'view' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {lang === 'en' ? 'Usage & Results' : 'Uso y Resultados'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400">{lang === 'en' ? 'Times Used' : 'Veces Usado'}</p>
                  <p className="text-2xl font-bold text-emerald-400">{analytics.timesUsed}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">{lang === 'en' ? 'Times Completed' : 'Veces Completado'}</p>
                  <p className="text-2xl font-bold text-blue-400">{analytics.timesCompleted}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">{lang === 'en' ? 'Completion Rate' : 'Tasa de Completitud'}</p>
                  <p className="text-2xl font-bold text-yellow-400">{Math.round(analytics.completionRate)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">{lang === 'en' ? 'Total Sessions' : 'Sesiones Totales'}</p>
                  <p className="text-2xl font-bold text-purple-400">{analytics.totalSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workout Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Workout Structure */}
          <div className="lg:col-span-2 space-y-6">
            {clientPreview ? (
              <ClientPreviewView workout={workout} lang={lang} />
            ) : (
              <WorkoutStructureView
                workout={workout}
                mode={mode}
                editData={editData}
                setEditData={setEditData}
                lang={lang}
              />
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {lang === 'en' ? 'Workout Details' : 'Detalles del Entrenamiento'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mode === 'view' ? (
                  <>
                    {workout.description && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">{lang === 'en' ? 'Description' : 'Descripción'}</p>
                        <p className="text-sm">{workout.description}</p>
                      </div>
                    )}
                    {workout.goal && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">{lang === 'en' ? 'Goal' : 'Objetivo'}</p>
                        <Badge variant="default">{workout.goal}</Badge>
                      </div>
                    )}
                    {workout.difficulty && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">{lang === 'en' ? 'Difficulty' : 'Dificultad'}</p>
                        <Badge variant="default">{workout.difficulty}</Badge>
                      </div>
                    )}
                    {workout.trainingEnvironment && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">{lang === 'en' ? 'Environment' : 'Entorno'}</p>
                        <Badge variant="default">{workout.trainingEnvironment}</Badge>
                      </div>
                    )}
                    {workout.estimatedDuration && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">{lang === 'en' ? 'Duration' : 'Duración'}</p>
                        <p className="text-sm font-semibold">{workout.estimatedDuration} {lang === 'en' ? 'minutes' : 'minutos'}</p>
                      </div>
                    )}
                    {workout.tags && workout.tags.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">{lang === 'en' ? 'Tags' : 'Etiquetas'}</p>
                        <div className="flex flex-wrap gap-2">
                          {workout.tags.map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">{lang === 'en' ? 'Description' : 'Descripción'}</label>
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">{lang === 'en' ? 'Goal' : 'Objetivo'}</label>
                      <select
                        value={editData.goal}
                        onChange={(e) => setEditData({ ...editData, goal: e.target.value })}
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
                      <label className="text-xs text-slate-400 mb-1 block">{lang === 'en' ? 'Difficulty' : 'Dificultad'}</label>
                      <select
                        value={editData.difficulty}
                        onChange={(e) => setEditData({ ...editData, difficulty: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
                      >
                        <option value="">{lang === 'en' ? 'Select...' : 'Seleccionar...'}</option>
                        <option value="BEGINNER">{lang === 'en' ? 'Beginner' : 'Principiante'}</option>
                        <option value="INTERMEDIATE">{lang === 'en' ? 'Intermediate' : 'Intermedio'}</option>
                        <option value="ADVANCED">{lang === 'en' ? 'Advanced' : 'Avanzado'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">{lang === 'en' ? 'Estimated Duration' : 'Duración Estimada'}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="10"
                          max="60"
                          value={editData.estimatedDuration}
                          onChange={(e) => setEditData({ ...editData, estimatedDuration: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-sm w-12">{editData.estimatedDuration} min</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">{lang === 'en' ? 'Visibility' : 'Visibilidad'}</label>
                      <select
                        value={editData.visibility}
                        onChange={(e) => setEditData({ ...editData, visibility: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50 text-sm"
                        disabled={isGlobal && !isAdmin}
                      >
                        <option value="PRIVATE">{lang === 'en' ? 'Private' : 'Privado'}</option>
                        <option value="TEAM">{lang === 'en' ? 'Team' : 'Equipo'}</option>
                        {isAdmin && <option value="PUBLIC">{lang === 'en' ? 'Public' : 'Público'}</option>}
                      </select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Archive Confirmation Modal */}
        {showArchiveConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  {isArchived
                    ? (lang === 'en' ? 'Unarchive Workout?' : '¿Desarchivar Entrenamiento?')
                    : (lang === 'en' ? 'Archive Workout?' : '¿Archivar Entrenamiento?')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  {isArchived
                    ? (lang === 'en'
                        ? 'This workout will become active again and appear in the library for new assignments.'
                        : 'Este entrenamiento volverá a estar activo y aparecerá en la biblioteca para nuevas asignaciones.')
                    : (lang === 'en'
                        ? 'This workout will no longer appear in the library for new assignments. Existing clients will still see it in their schedules.'
                        : 'Este entrenamiento ya no aparecerá en la biblioteca para nuevas asignaciones. Los clientes existentes aún lo verán en sus horarios.')}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleArchive}
                    disabled={saving}
                    className="flex-1"
                  >
                    {isArchived
                      ? (lang === 'en' ? 'Unarchive' : 'Desarchivar')
                      : (lang === 'en' ? 'Archive' : 'Archivar')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowArchiveConfirm(false)}
                    disabled={saving}
                  >
                    {lang === 'en' ? 'Cancel' : 'Cancelar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

// Workout Structure View Component
function WorkoutStructureView({
  workout,
  mode,
  editData,
  setEditData,
  lang,
}: {
  workout: any;
  mode: Mode;
  editData: any;
  setEditData: (data: any) => void;
  lang: Lang;
}) {
  return (
    <div className="space-y-6">
      {workout.sections.map((section: any) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.name}</CardTitle>
            {section.notes && (
              <CardDescription>{section.notes}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {section.blocks.map((block: any) => (
              <div key={block.id} className="border-t border-slate-800 pt-4">
                {block.title && (
                  <h3 className="font-semibold mb-3">{block.title}</h3>
                )}
                {block.instructions && (
                  <p className="text-sm text-slate-400 mb-3">{block.instructions}</p>
                )}

                {/* Exercises */}
                <div className="space-y-3">
                  {block.exercises.map((exercise: any) => {
                    const targetReps = (exercise.targetRepsBySet as number[]) || [];
                    const targetWeights = (exercise.targetWeightBySet as (number | null)[]) || [];

                    return (
                      <div key={exercise.id} className="bg-slate-900/60 rounded-lg p-4">
                        <h4 className="font-bold mb-2">{exercise.name}</h4>
                        {exercise.notes && (
                          <p className="text-sm text-slate-400 mb-2">{exercise.notes}</p>
                        )}
                        <div className="space-y-1">
                          {targetReps.map((reps: number, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className="text-slate-400">Set {idx + 1}:</span>
                              <span>{reps} reps</span>
                              {targetWeights[idx] && (
                                <span className="text-slate-400">@ {targetWeights[idx]}kg</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Client Preview View Component
function ClientPreviewView({ workout, lang }: { workout: any; lang: Lang }) {
  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-400" />
          {lang === 'en' ? 'Client Preview' : 'Vista Cliente'}
        </CardTitle>
        <CardDescription>
          {lang === 'en'
            ? 'This is how clients will see this workout'
            : 'Así es como los clientes verán este entrenamiento'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{workout.name}</h2>
            {workout.description && (
              <p className="text-slate-300">{workout.description}</p>
            )}
          </div>

          {workout.sections.map((section: any) => (
            <div key={section.id} className="space-y-4">
              <h3 className="text-lg font-semibold">{section.name}</h3>
              {section.blocks.map((block: any) => (
                <div key={block.id} className="space-y-3">
                  {block.exercises.map((exercise: any) => (
                    <div key={exercise.id} className="bg-slate-900/60 rounded-lg p-4">
                      <h4 className="font-bold text-lg mb-2">{exercise.name}</h4>
                      {exercise.notes && (
                        <p className="text-sm text-emerald-100/80 mb-2">💡 {exercise.notes}</p>
                      )}
                      <div className="space-y-2">
                        {((exercise.targetRepsBySet as number[]) || []).map((reps: number, idx: number) => {
                          const weight = ((exercise.targetWeightBySet as (number | null)[]) || [])[idx];
                          return (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className="font-semibold">Set {idx + 1}:</span>
                              <span>{reps} reps</span>
                              {weight ? (
                                <span>@ {weight}kg</span>
                              ) : (
                                <span className="text-emerald-400 italic">
                                  {lang === 'en' ? 'choose weight' : 'elige peso'}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <Button className="flex-1" size="lg">
              {lang === 'en' ? 'Start Workout' : 'Comenzar Entrenamiento'} 💪
            </Button>
            <Button variant="secondary" size="lg">
              {lang === 'en' ? 'Done' : 'Completado'} ✓
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

