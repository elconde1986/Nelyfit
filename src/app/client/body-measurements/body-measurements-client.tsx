'use client';

import { useState, useEffect } from 'react';
import { Ruler, Plus, Edit, Trash2, TrendingUp, Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Lang } from '@/lib/i18n';
import { MeasurementEntryForm } from './measurement-entry-form';
import { MeasurementsChart } from './measurements-chart';

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
  thighs?: number; // Legacy
  createdAt: string;
};

export function BodyMeasurementsClient({ userId, lang }: { userId: string; lang: Lang }) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedMetric, setSelectedMetric] = useState<string>('waist');

  const fetchMeasurements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/tracking/body-measurements?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMeasurements(data.measurements || []);
      }
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'en' ? 'Delete this measurement?' : '¿Eliminar esta medición?')) return;

    try {
      const res = await fetch(`/api/tracking/body-measurements/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMeasurements(measurements.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Error deleting measurement:', error);
      alert(lang === 'en' ? 'Failed to delete' : 'Error al eliminar');
    }
  };

  const convertUnit = (value: number | null | undefined, from: 'metric' | 'imperial', to: 'metric' | 'imperial') => {
    if (!value) return null;
    if (from === to) return value;
    if (from === 'metric' && to === 'imperial') return value * 0.393701; // cm to inches
    if (from === 'imperial' && to === 'metric') return value * 2.54; // inches to cm
    return value;
  };

  const availableMetrics = [
    { key: 'weight', label: lang === 'en' ? 'Weight' : 'Peso', unit: unit === 'metric' ? 'kg' : 'lbs' },
    { key: 'waist', label: lang === 'en' ? 'Waist' : 'Cintura', unit: unit === 'metric' ? 'cm' : 'in' },
    { key: 'chest', label: lang === 'en' ? 'Chest' : 'Pecho', unit: unit === 'metric' ? 'cm' : 'in' },
    { key: 'hips', label: lang === 'en' ? 'Hips' : 'Cadera', unit: unit === 'metric' ? 'cm' : 'in' },
    { key: 'bicepL', label: lang === 'en' ? 'Bicep (L)' : 'Bíceps (I)', unit: unit === 'metric' ? 'cm' : 'in' },
    { key: 'bicepR', label: lang === 'en' ? 'Bicep (R)' : 'Bíceps (D)', unit: unit === 'metric' ? 'cm' : 'in' },
    { key: 'thighL', label: lang === 'en' ? 'Thigh (L)' : 'Muslo (I)', unit: unit === 'metric' ? 'cm' : 'in' },
    { key: 'thighR', label: lang === 'en' ? 'Thigh (R)' : 'Muslo (D)', unit: unit === 'metric' ? 'cm' : 'in' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Body Measurements' : 'Mediciones Corporales'}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'en'
              ? 'Track your body measurements over time'
              : 'Rastrea tus mediciones corporales con el tiempo'}
          </p>
        </div>
        <Button onClick={() => {
          setEditingMeasurement(null);
          setShowForm(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          {lang === 'en' ? 'Log Measurement' : 'Registrar Medición'}
        </Button>
      </header>

      {/* Unit Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              {lang === 'en' ? 'Units' : 'Unidades'}
            </span>
            <div className="flex gap-2">
              <Button
                variant={unit === 'metric' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setUnit('metric')}
              >
                {lang === 'en' ? 'Metric (cm/kg)' : 'Métrico (cm/kg)'}
              </Button>
              <Button
                variant={unit === 'imperial' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setUnit('imperial')}
              >
                {lang === 'en' ? 'Imperial (in/lbs)' : 'Imperial (in/lbs)'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {lang === 'en' ? 'Filters' : 'Filtros'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                {lang === 'en' ? 'Start Date' : 'Fecha Inicio'}
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="bg-slate-800 border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                {lang === 'en' ? 'End Date' : 'Fecha Fin'}
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="bg-slate-800 border-slate-700 text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ startDate: '', endDate: '' })}
                className="w-full"
              >
                <X className="w-4 h-4 mr-1" />
                {lang === 'en' ? 'Clear' : 'Limpiar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {measurements.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                {lang === 'en' ? 'Progress Chart' : 'Gráfico de Progreso'}
              </CardTitle>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
              >
                {availableMetrics.map(metric => (
                  <option key={metric.key} value={metric.key}>
                    {metric.label} ({metric.unit})
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <MeasurementsChart
              measurements={measurements}
              metric={selectedMetric}
              unit={unit}
              lang={lang}
            />
          </CardContent>
        </Card>
      )}

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            {lang === 'en' ? 'Measurement History' : 'Historial de Mediciones'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              {lang === 'en' ? 'Loading...' : 'Cargando...'}
            </div>
          ) : measurements.length === 0 ? (
            <div className="text-center py-12">
              <Ruler className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">
                {lang === 'en'
                  ? 'No measurements logged yet. Log your first measurement!'
                  : 'Aún no hay mediciones registradas. ¡Registra tu primera medición!'}
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Log First Measurement' : 'Registrar Primera Medición'}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-3 text-sm font-semibold text-slate-400">
                      {lang === 'en' ? 'Date' : 'Fecha'}
                    </th>
                    {availableMetrics.map(metric => (
                      <th key={metric.key} className="text-right p-3 text-sm font-semibold text-slate-400">
                        {metric.label}
                      </th>
                    ))}
                    <th className="text-right p-3 text-sm font-semibold text-slate-400">
                      {lang === 'en' ? 'Actions' : 'Acciones'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((measurement) => (
                    <tr key={measurement.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                      <td className="p-3 text-sm">
                        {new Date(measurement.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES')}
                      </td>
                      {availableMetrics.map(metric => {
                        const value = convertUnit(
                          (measurement as any)[metric.key],
                          'metric',
                          unit
                        );
                        return (
                          <td key={metric.key} className="p-3 text-sm text-right">
                            {value ? `${value.toFixed(1)} ${metric.unit}` : '-'}
                          </td>
                        );
                      })}
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingMeasurement(measurement);
                              setShowForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(measurement.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry Form Modal */}
      {showForm && (
        <MeasurementEntryForm
          measurement={editingMeasurement}
          onClose={() => {
            setShowForm(false);
            setEditingMeasurement(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditingMeasurement(null);
            fetchMeasurements();
          }}
          unit={unit}
          lang={lang}
        />
      )}
    </div>
  );
}

