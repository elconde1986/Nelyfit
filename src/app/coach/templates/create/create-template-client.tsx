'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createTemplate } from './actions';
import { Lang } from '@/lib/i18n';

const WORKOUT_ROLES = [
  'FULL_BODY',
  'UPPER',
  'LOWER',
  'CARDIO',
  'HIIT',
  'RECOVERY',
  'CORE',
  'CUSTOM',
] as const;

export default function CreateTemplateClient({ coachId, lang }: { coachId: string; lang: Lang }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    weeks: 4,
    visibility: 'PRIVATE' as 'PRIVATE' | 'TEAM' | 'PUBLIC',
  });
  const [days, setDays] = useState<Array<{
    dayIndex: number;
    title: string;
    workoutRole: string;
    isRestDay: boolean;
    notes: string;
  }>>([
    { dayIndex: 1, title: 'Day 1', workoutRole: 'FULL_BODY', isRestDay: false, notes: '' },
  ]);

  const addDay = () => {
    setDays([...days, {
      dayIndex: days.length + 1,
      title: `Day ${days.length + 1}`,
      workoutRole: 'FULL_BODY',
      isRestDay: false,
      notes: '',
    }]);
  };

  const removeDay = (index: number) => {
    setDays(days.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayIndex: i + 1 })));
  };

  const updateDay = (index: number, field: string, value: any) => {
    const updated = [...days];
    updated[index] = { ...updated[index], [field]: value };
    setDays(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await createTemplate({
        ...formData,
        days: days.map((d, i) => ({ ...d, dayIndex: i + 1 })),
      }, coachId);
      router.push('/coach/templates');
      router.refresh();
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>Basic information about your program template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Beginner Strength Program"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
              placeholder="Describe this program template..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Weeks</label>
              <input
                type="number"
                min="1"
                max="52"
                value={formData.weeks}
                onChange={(e) => setFormData({ ...formData, weeks: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Visibility</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                className="w-full px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="PRIVATE">Private</option>
                <option value="TEAM">Team</option>
                <option value="PUBLIC">Public</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Program Days</CardTitle>
              <CardDescription>Define the structure of your program</CardDescription>
            </div>
            <Button type="button" onClick={addDay} variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Day
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map((day, index) => (
            <Card key={index} className="border-slate-800">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Day {day.dayIndex}</h4>
                  {days.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeDay(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => updateDay(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                    <select
                      value={day.workoutRole}
                      onChange={(e) => updateDay(index, 'workoutRole', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {WORKOUT_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.isRestDay}
                        onChange={(e) => updateDay(index, 'isRestDay', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-400">Rest Day</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
                  <textarea
                    value={day.notes}
                    onChange={(e) => updateDay(index, 'notes', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1" size="lg">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Creating...' : 'Create Template'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push('/coach/templates')} size="lg">
          Cancel
        </Button>
      </div>
    </form>
  );
}

