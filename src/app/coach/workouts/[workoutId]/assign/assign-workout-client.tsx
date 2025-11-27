'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';
import { assignWorkoutToClient, assignWorkoutToProgram } from './actions';

type AssignmentMode = 'client' | 'program';

export default function AssignWorkoutClient({
  workout,
  clients,
  programs,
  coachId,
  preselectedClientId,
  lang,
}: {
  workout: any;
  clients: any[];
  programs: any[];
  coachId: string;
  preselectedClientId?: string;
  lang: Lang;
}) {
  const router = useRouter();
  const t = translations.coach[lang] || translations.coach.en;
  const [mode, setMode] = useState<AssignmentMode>('client');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    preselectedClientId || null
  );
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [assignmentDate, setAssignmentDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [recurring, setRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<string[]>([]);
  const [recurringWeeks, setRecurringWeeks] = useState<number>(4);
  const [sendNotification, setSendNotification] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAssign = async () => {
    setSaving(true);
    try {
      if (mode === 'client') {
        if (!selectedClientId) {
          alert(lang === 'en' ? 'Please select a client' : 'Por favor selecciona un cliente');
          setSaving(false);
          return;
        }

        const result = await assignWorkoutToClient({
          workoutId: workout.id,
          clientId: selectedClientId,
          date: assignmentDate,
          recurring,
          recurringPattern,
          recurringWeeks,
          sendNotification,
          message,
        });

        if (result.success) {
          router.push(`/coach/clients/${selectedClientId}`);
        } else {
          alert(result.error || (lang === 'en' ? 'Failed to assign workout' : 'Error al asignar entrenamiento'));
        }
      } else {
        if (!selectedProgramId || selectedDayIndex === null) {
          alert(lang === 'en' ? 'Please select a program and day' : 'Por favor selecciona un programa y día');
          setSaving(false);
          return;
        }

        const result = await assignWorkoutToProgram({
          workoutId: workout.id,
          programId: selectedProgramId,
          dayIndex: selectedDayIndex,
        });

        if (result.success) {
          router.push(`/coach/workouts/${workout.id}`);
        } else {
          alert(result.error || (lang === 'en' ? 'Failed to assign workout' : 'Error al asignar entrenamiento'));
        }
      }
    } catch (error) {
      console.error('Error assigning workout:', error);
      alert(lang === 'en' ? 'Failed to assign workout' : 'Error al asignar entrenamiento');
    } finally {
      setSaving(false);
    }
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/coach/workouts/${workout.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">
                  {lang === 'en' ? 'Assign Workout' : 'Asignar Entrenamiento'}
                </span>
              </h1>
              <p className="text-slate-400 mt-1">{workout.name}</p>
            </div>
          </div>
        </div>

        {/* Workout Summary */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2">{workout.name}</h3>
                <div className="flex gap-2 flex-wrap">
                  {workout.difficulty && (
                    <Badge variant="default">{workout.difficulty}</Badge>
                  )}
                  {workout.goal && (
                    <Badge variant="outline">{workout.goal}</Badge>
                  )}
                  {workout.estimatedDuration && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {workout.estimatedDuration} {lang === 'en' ? 'min' : 'min'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mode Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Assignment Method' : 'Método de Asignación'}</CardTitle>
            <CardDescription>
              {lang === 'en'
                ? 'Choose how to assign this workout'
                : 'Elige cómo asignar este entrenamiento'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={mode === 'client' ? 'default' : 'outline'}
                onClick={() => setMode('client')}
                className="h-auto py-4"
              >
                <User className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">
                    {lang === 'en' ? 'Direct to Client' : 'Directo a Cliente'}
                  </div>
                  <div className="text-xs opacity-80">
                    {lang === 'en' ? 'One-off or recurring' : 'Único o recurrente'}
                  </div>
                </div>
              </Button>
              <Button
                variant={mode === 'program' ? 'default' : 'outline'}
                onClick={() => setMode('program')}
                className="h-auto py-4"
              >
                <Calendar className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">
                    {lang === 'en' ? 'Via Program' : 'Vía Programa'}
                  </div>
                  <div className="text-xs opacity-80">
                    {lang === 'en' ? 'Add to program day' : 'Agregar a día del programa'}
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client Assignment Form */}
        {mode === 'client' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{lang === 'en' ? 'Select Client' : 'Seleccionar Cliente'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  {lang === 'en' ? 'Client' : 'Cliente'}
                </label>
                <select
                  value={selectedClientId || ''}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                >
                  <option value="">
                    {lang === 'en' ? 'Select a client...' : 'Selecciona un cliente...'}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.user.name} ({client.user.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedClient && (
                <>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      {lang === 'en' ? 'Assignment Date' : 'Fecha de Asignación'}
                    </label>
                    <input
                      type="date"
                      value={assignmentDate}
                      onChange={(e) => setAssignmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recurring}
                        onChange={(e) => setRecurring(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        {lang === 'en' ? 'Recurring assignment' : 'Asignación recurrente'}
                      </span>
                    </label>
                  </div>

                  {recurring && (
                    <div className="space-y-3 pl-6 border-l-2 border-slate-700">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">
                          {lang === 'en' ? 'Days of week' : 'Días de la semana'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 'monday', label: lang === 'en' ? 'Mon' : 'Lun' },
                            { value: 'tuesday', label: lang === 'en' ? 'Tue' : 'Mar' },
                            { value: 'wednesday', label: lang === 'en' ? 'Wed' : 'Mié' },
                            { value: 'thursday', label: lang === 'en' ? 'Thu' : 'Jue' },
                            { value: 'friday', label: lang === 'en' ? 'Fri' : 'Vie' },
                            { value: 'saturday', label: lang === 'en' ? 'Sat' : 'Sáb' },
                            { value: 'sunday', label: lang === 'en' ? 'Sun' : 'Dom' },
                          ].map((day) => (
                            <Button
                              key={day.value}
                              type="button"
                              variant={
                                recurringPattern.includes(day.value) ? 'default' : 'outline'
                              }
                              size="sm"
                              onClick={() => {
                                if (recurringPattern.includes(day.value)) {
                                  setRecurringPattern(
                                    recurringPattern.filter((d) => d !== day.value)
                                  );
                                } else {
                                  setRecurringPattern([...recurringPattern, day.value]);
                                }
                              }}
                            >
                              {day.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-2 block">
                          {lang === 'en' ? 'Number of weeks' : 'Número de semanas'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={recurringWeeks}
                          onChange={(e) => setRecurringWeeks(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendNotification}
                        onChange={(e) => setSendNotification(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        {lang === 'en' ? 'Send notification to client' : 'Enviar notificación al cliente'}
                      </span>
                    </label>
                  </div>

                  {sendNotification && (
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        {lang === 'en' ? 'Message (optional)' : 'Mensaje (opcional)'}
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        placeholder={
                          lang === 'en'
                            ? 'Add a personal message for the client...'
                            : 'Agrega un mensaje personal para el cliente...'
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Program Assignment Form */}
        {mode === 'program' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{lang === 'en' ? 'Select Program & Day' : 'Seleccionar Programa y Día'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  {lang === 'en' ? 'Program' : 'Programa'}
                </label>
                <select
                  value={selectedProgramId || ''}
                  onChange={(e) => {
                    setSelectedProgramId(e.target.value);
                    setSelectedDayIndex(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                >
                  <option value="">
                    {lang === 'en' ? 'Select a program...' : 'Selecciona un programa...'}
                  </option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name} ({program._count.clients}{' '}
                      {lang === 'en' ? 'clients' : 'clientes'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProgram && (
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    {lang === 'en' ? 'Program Day' : 'Día del Programa'}
                  </label>
                  <select
                    value={selectedDayIndex !== null ? selectedDayIndex.toString() : ''}
                    onChange={(e) => setSelectedDayIndex(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                  >
                    <option value="">
                      {lang === 'en' ? 'Select a day...' : 'Selecciona un día...'}
                    </option>
                    {selectedProgram.days.map((day: any) => (
                      <option key={day.id} value={day.dayIndex}>
                        Day {day.dayIndex + 1}: {day.title}
                        {day.workoutId && (
                          <span className="text-yellow-400">
                            {' '}
                            ({lang === 'en' ? 'has workout' : 'tiene entrenamiento'})
                          </span>
                        )}
                      </option>
                    ))}
                  </select>
                  {selectedDayIndex !== null &&
                    selectedProgram.days[selectedDayIndex]?.workoutId && (
                      <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-yellow-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {lang === 'en'
                            ? 'This day already has a workout. It will be replaced.'
                            : 'Este día ya tiene un entrenamiento. Será reemplazado.'}
                        </p>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleAssign}
            disabled={saving || (mode === 'client' && !selectedClientId) || (mode === 'program' && (!selectedProgramId || selectedDayIndex === null))}
            className="flex-1"
          >
            <Send className="w-4 h-4 mr-2" />
            {saving
              ? lang === 'en'
                ? 'Assigning...'
                : 'Asignando...'
              : lang === 'en'
              ? 'Assign Workout'
              : 'Asignar Entrenamiento'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            disabled={saving}
          >
            <X className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Cancel' : 'Cancelar'}
          </Button>
        </div>
      </div>
    </main>
  );
}

