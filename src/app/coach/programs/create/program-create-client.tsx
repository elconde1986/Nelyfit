'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Calendar,
  Settings,
  Plus,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';
import { createProgram } from './actions';

export default function ProgramCreateClient({
  coachId,
  lang,
}: {
  coachId: string;
  lang: Lang;
}) {
  const router = useRouter();
  const t = translations.coach[lang] || translations.coach.en;
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  // Program metadata
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goalTags, setGoalTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>('');
  const [totalWeeks, setTotalWeeks] = useState(4);
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(3);
  const [visibility, setVisibility] = useState<'PRIVATE' | 'TEAM' | 'PUBLIC'>('PRIVATE');
  const [tagInput, setTagInput] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      alert(lang === 'en' ? 'Please enter a program name' : 'Por favor ingresa un nombre de programa');
      return;
    }

    setSaving(true);
    try {
      const result = await createProgram({
        name,
        description,
        goalTags,
        difficulty,
        totalWeeks,
        targetDaysPerWeek,
        visibility,
      });

      if (result.success) {
        router.push(`/coach/programs/${result.programId}/planner`);
      } else {
        alert(result.error || (lang === 'en' ? 'Failed to create program' : 'Error al crear programa'));
      }
    } catch (error) {
      console.error('Error creating program:', error);
      alert(lang === 'en' ? 'Failed to create program' : 'Error al crear programa');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !goalTags.includes(tagInput.trim())) {
      setGoalTags([...goalTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setGoalTags(goalTags.filter((t) => t !== tag));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
                <span className="gradient-text">
                  {lang === 'en' ? 'Create Program' : 'Crear Programa'}
                </span>
              </h1>
              <p className="text-slate-400 mt-1">
                {lang === 'en'
                  ? 'Step 1: Program basics'
                  : 'Paso 1: Datos básicos del programa'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {lang === 'en' ? 'Program Details' : 'Detalles del Programa'}
            </CardTitle>
            <CardDescription>
              {lang === 'en'
                ? 'Set up the basic information for your training program'
                : 'Configura la información básica de tu programa de entrenamiento'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                {lang === 'en' ? 'Program Name' : 'Nombre del Programa'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'en' ? 'e.g., 4-Week Strength Builder' : 'ej., Constructor de Fuerza 4 Semanas'}
                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                {lang === 'en' ? 'Description' : 'Descripción'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={lang === 'en' ? 'Describe the program goals and approach...' : 'Describe los objetivos y enfoque del programa...'}
                className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                {lang === 'en' ? 'Goal Tags' : 'Etiquetas de Objetivo'}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder={lang === 'en' ? 'Add tag...' : 'Agregar etiqueta...'}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                />
                <Button type="button" onClick={addTag} variant="secondary">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {goalTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {goalTags.map((tag) => (
                    <Badge key={tag} variant="default" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  {lang === 'en' ? 'Difficulty' : 'Dificultad'}
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                >
                  <option value="">{lang === 'en' ? 'Select...' : 'Seleccionar...'}</option>
                  <option value="BEGINNER">{lang === 'en' ? 'Beginner' : 'Principiante'}</option>
                  <option value="INTERMEDIATE">{lang === 'en' ? 'Intermediate' : 'Intermedio'}</option>
                  <option value="ADVANCED">{lang === 'en' ? 'Advanced' : 'Avanzado'}</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">
                  {lang === 'en' ? 'Visibility' : 'Visibilidad'}
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                >
                  <option value="PRIVATE">{lang === 'en' ? 'Private' : 'Privado'}</option>
                  <option value="TEAM">{lang === 'en' ? 'Team' : 'Equipo'}</option>
                  <option value="PUBLIC">{lang === 'en' ? 'Public' : 'Público'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  {lang === 'en' ? 'Total Weeks' : 'Total de Semanas'} (1-16)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={totalWeeks}
                    onChange={(e) => setTotalWeeks(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{totalWeeks}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">
                  {lang === 'en' ? 'Days Per Week' : 'Días por Semana'} (2-7)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="2"
                    max="7"
                    value={targetDaysPerWeek}
                    onChange={(e) => setTargetDaysPerWeek(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12 text-right">{targetDaysPerWeek}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCreate}
                disabled={saving || !name.trim()}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving
                  ? lang === 'en'
                    ? 'Creating...'
                    : 'Creando...'
                  : lang === 'en'
                  ? 'Create & Plan'
                  : 'Crear y Planificar'}
              </Button>
              <Button asChild variant="ghost">
                <Link href="/coach/programs">
                  {lang === 'en' ? 'Cancel' : 'Cancelar'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

