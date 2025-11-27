'use client';

import { useState } from 'react';
import {
  Sparkles,
  Users,
  Target,
  Calendar,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lang } from '@/lib/i18n';

const TEMPLATES = [
  {
    id: '3x_week_general',
    name: '3x/Week General Fitness',
    nameEs: '3x/Semana Fitness General',
    description: 'Full body workouts, 3 days per week',
    descriptionEs: 'Entrenamientos de cuerpo completo, 3 días por semana',
    daysPerWeek: 3,
    pattern: ['FULL_BODY', 'REST', 'FULL_BODY', 'REST', 'FULL_BODY', 'REST', 'REST'],
  },
  {
    id: '5x_week_hypertrophy',
    name: '5x/Week Hypertrophy',
    nameEs: '5x/Semana Hipertrofia',
    description: 'Upper/Lower split, 5 days per week',
    descriptionEs: 'División Superior/Inferior, 5 días por semana',
    daysPerWeek: 5,
    pattern: ['UPPER', 'LOWER', 'UPPER', 'LOWER', 'FULL_BODY', 'REST', 'REST'],
  },
  {
    id: '2x_week_minimal',
    name: '2x/Week Minimal Equipment',
    nameEs: '2x/Semana Equipo Mínimo',
    description: 'Bodyweight focused, 2 days per week',
    descriptionEs: 'Enfoque en peso corporal, 2 días por semana',
    daysPerWeek: 2,
    pattern: ['FULL_BODY', 'REST', 'REST', 'FULL_BODY', 'REST', 'REST', 'REST'],
  },
  {
    id: '4x_week_fat_loss',
    name: '4x/Week Fat Loss',
    nameEs: '4x/Semana Pérdida de Grasa',
    description: 'Conditioning and strength, 4 days per week',
    descriptionEs: 'Acondicionamiento y fuerza, 4 días por semana',
    daysPerWeek: 4,
    pattern: ['CARDIO', 'STRENGTH', 'CARDIO', 'STRENGTH', 'REST', 'REST', 'REST'],
  },
];

export default function AutoGenerateModal({
  onGenerate,
  onClose,
  lang,
}: {
  onGenerate: (template: typeof TEMPLATES[0]) => void;
  onClose: () => void;
  lang: Lang;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {lang === 'en' ? 'Auto-Generate Program' : 'Generar Programa Automáticamente'}
          </CardTitle>
          <CardDescription>
            {lang === 'en'
              ? 'Select a template to automatically fill your program with workouts'
              : 'Selecciona una plantilla para llenar automáticamente tu programa con entrenamientos'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold">
                      {lang === 'en' ? template.name : template.nameEs}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {lang === 'en' ? template.description : template.descriptionEs}
                    </p>
                  </div>
                  {selectedTemplate === template.id && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {template.daysPerWeek} {lang === 'en' ? 'days/week' : 'días/semana'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-800">
            <Button
              onClick={() => {
                if (selectedTemplate) {
                  const template = TEMPLATES.find((t) => t.id === selectedTemplate);
                  if (template) {
                    onGenerate(template);
                  }
                }
              }}
              disabled={!selectedTemplate}
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {lang === 'en' ? 'Generate Program' : 'Generar Programa'}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {lang === 'en' ? 'Cancel' : 'Cancelar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

