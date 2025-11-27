'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lang } from '@/lib/i18n';

type Measurement = {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  bicepL?: number;
  bicepR?: number;
  forearmL?: number;
  forearmR?: number;
  thighL?: number;
  thighR?: number;
  calfL?: number;
  calfR?: number;
};

export function MeasurementEntryForm({
  measurement,
  onClose,
  onSaved,
  unit,
  lang,
}: {
  measurement: Measurement | null;
  onClose: () => void;
  onSaved: () => void;
  unit: 'metric' | 'imperial';
  lang: Lang;
}) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: measurement?.date || new Date().toISOString().split('T')[0],
    weight: measurement?.weight?.toString() || '',
    bodyFat: measurement?.bodyFat?.toString() || '',
    muscleMass: measurement?.muscleMass?.toString() || '',
    neck: measurement?.neck?.toString() || '',
    shoulders: measurement?.shoulders?.toString() || '',
    chest: measurement?.chest?.toString() || '',
    waist: measurement?.waist?.toString() || '',
    hips: measurement?.hips?.toString() || '',
    bicepL: measurement?.bicepL?.toString() || '',
    bicepR: measurement?.bicepR?.toString() || '',
    forearmL: measurement?.forearmL?.toString() || '',
    forearmR: measurement?.forearmR?.toString() || '',
    thighL: measurement?.thighL?.toString() || '',
    thighR: measurement?.thighR?.toString() || '',
    calfL: measurement?.calfL?.toString() || '',
    calfR: measurement?.calfR?.toString() || '',
  });

  const convertToMetric = (value: string) => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (unit === 'imperial') {
      // Convert inches to cm for measurements, lbs to kg for weight
      return num * 2.54; // For measurements (will handle weight separately)
    }
    return num;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data: any = {
        date: formData.date,
        weight: formData.weight ? (unit === 'imperial' ? parseFloat(formData.weight) * 0.453592 : parseFloat(formData.weight)) : null,
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
        muscleMass: formData.muscleMass ? (unit === 'imperial' ? parseFloat(formData.muscleMass) * 0.453592 : parseFloat(formData.muscleMass)) : null,
        neck: convertToMetric(formData.neck),
        shoulders: convertToMetric(formData.shoulders),
        chest: convertToMetric(formData.chest),
        waist: convertToMetric(formData.waist),
        hips: convertToMetric(formData.hips),
        bicepL: convertToMetric(formData.bicepL),
        bicepR: convertToMetric(formData.bicepR),
        forearmL: convertToMetric(formData.forearmL),
        forearmR: convertToMetric(formData.forearmR),
        thighL: convertToMetric(formData.thighL),
        thighR: convertToMetric(formData.thighR),
        calfL: convertToMetric(formData.calfL),
        calfR: convertToMetric(formData.calfR),
      };

      const url = measurement
        ? `/api/tracking/body-measurements/${measurement.id}`
        : '/api/tracking/body-measurements';
      const method = measurement ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        onSaved();
      } else {
        const error = await res.json();
        alert(error.error || (lang === 'en' ? 'Failed to save' : 'Error al guardar'));
      }
    } catch (error) {
      console.error('Error saving measurement:', error);
      alert(lang === 'en' ? 'An error occurred' : 'Ocurrió un error');
    } finally {
      setSaving(false);
    }
  };

  const weightUnit = unit === 'metric' ? 'kg' : 'lbs';
  const measureUnit = unit === 'metric' ? 'cm' : 'in';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {measurement
                ? lang === 'en'
                  ? 'Edit Measurement'
                  : 'Editar Medición'
                : lang === 'en'
                ? 'Log Body Measurement'
                : 'Registrar Medición Corporal'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Date' : 'Fecha'}
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'Weight' : 'Peso'} ({weightUnit})
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'Body Fat %' : 'Grasa Corporal %'}
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.bodyFat}
                  onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">
                  {lang === 'en' ? 'Muscle Mass' : 'Masa Muscular'} ({weightUnit})
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.muscleMass}
                  onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                {lang === 'en' ? 'Upper Body' : 'Torso Superior'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Neck' : 'Cuello'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.neck}
                    onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Shoulders' : 'Hombros'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.shoulders}
                    onChange={(e) => setFormData({ ...formData, shoulders: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Chest' : 'Pecho'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.chest}
                    onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Waist' : 'Cintura'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Hips' : 'Cadera'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.hips}
                    onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                {lang === 'en' ? 'Arms' : 'Brazos'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Bicep (L)' : 'Bíceps (I)'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.bicepL}
                    onChange={(e) => setFormData({ ...formData, bicepL: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Bicep (R)' : 'Bíceps (D)'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.bicepR}
                    onChange={(e) => setFormData({ ...formData, bicepR: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Forearm (L)' : 'Antebrazo (I)'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.forearmL}
                    onChange={(e) => setFormData({ ...formData, forearmL: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Forearm (R)' : 'Antebrazo (D)'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.forearmR}
                    onChange={(e) => setFormData({ ...formData, forearmR: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                {lang === 'en' ? 'Legs' : 'Piernas'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Thigh (L)' : 'Muslo (I)'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.thighL}
                    onChange={(e) => setFormData({ ...formData, thighL: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Thigh (R)' : 'Muslo (D)'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.thighR}
                    onChange={(e) => setFormData({ ...formData, thighR: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Calf (L)' : 'Pantorrilla (I)'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.calfL}
                    onChange={(e) => setFormData({ ...formData, calfL: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    {lang === 'en' ? 'Calf (R)' : 'Pantorrilla (D)'} ({measureUnit})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.calfR}
                    onChange={(e) => setFormData({ ...formData, calfR: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {saving
                  ? lang === 'en'
                    ? 'Saving...'
                    : 'Guardando...'
                  : lang === 'en'
                  ? 'Save Measurement'
                  : 'Guardar Medición'}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                {lang === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

