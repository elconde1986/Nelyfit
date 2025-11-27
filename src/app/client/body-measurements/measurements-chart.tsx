'use client';

import { useMemo } from 'react';
import { Lang } from '@/lib/i18n';

type Measurement = {
  id: string;
  date: string;
  [key: string]: any;
};

function convertUnit(
  value: number | null | undefined,
  from: 'metric' | 'imperial',
  to: 'metric' | 'imperial',
  metricType: string
) {
  if (!value) return 0;
  if (from === to) return value;
  if (from === 'metric' && to === 'imperial') {
    // cm to inches for measurements, kg to lbs for weight
    return metricType === 'weight' ? value * 2.20462 : value * 0.393701;
  }
  if (from === 'imperial' && to === 'metric') {
    return metricType === 'weight' ? value * 0.453592 : value * 2.54;
  }
  return value;
}

export function MeasurementsChart({
  measurements,
  metric,
  unit,
  lang,
}: {
  measurements: Measurement[];
  metric: string;
  unit: 'metric' | 'imperial';
  lang: Lang;
}) {
  const chartData = useMemo(() => {
    const sorted = [...measurements].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted
      .filter(m => (m as any)[metric] != null)
      .map(m => ({
        date: new Date(m.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
          month: 'short',
          day: 'numeric',
        }),
        value: convertUnit((m as any)[metric], 'metric', unit, metric),
      }));
  }, [measurements, metric, unit, lang]);

  const maxValue = Math.max(...chartData.map(d => d.value), 0);
  const minValue = Math.min(...chartData.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const unitLabel = metric === 'weight' 
    ? (unit === 'metric' ? 'kg' : 'lbs')
    : (unit === 'metric' ? 'cm' : 'in');

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        {lang === 'en' ? 'No data available for this metric' : 'No hay datos disponibles para esta métrica'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-64 flex items-end gap-2">
        {chartData.map((point, idx) => {
          const height = ((point.value - minValue) / range) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-slate-800 rounded-t relative" style={{ height: `${height}%` }}>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">
                  {point.value.toFixed(1)}
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2 rotate-45 origin-top-left whitespace-nowrap">
                {point.date}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center text-sm text-slate-400">
        {lang === 'en' ? 'Values in' : 'Valores en'} {unitLabel}
      </div>
    </div>
  );
}

