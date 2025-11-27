'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Save } from 'lucide-react';
import { Lang } from '@/lib/i18n';

export default function CreateGroupClient({ lang, coachId }: { lang: Lang; coachId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/community/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          coachId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/community/groups/${data.group.id}`);
      } else {
        alert(lang === 'en' ? 'Failed to create group' : 'Error al crear grupo');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert(lang === 'en' ? 'Failed to create group' : 'Error al crear grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          {lang === 'en' ? 'Group Details' : 'Detalles del Grupo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              {lang === 'en' ? 'Group Name' : 'Nombre del Grupo'} *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={lang === 'en' ? 'e.g., Strength Training Community' : 'ej., Comunidad de Entrenamiento de Fuerza'}
              className="bg-slate-900/60 border-slate-700"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              {lang === 'en' ? 'Description' : 'Descripción'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={lang === 'en' ? 'Describe the group...' : 'Describe el grupo...'}
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900/60 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="isPublic" className="text-sm text-slate-300 cursor-pointer">
              {lang === 'en' ? 'Make this group public' : 'Hacer este grupo público'}
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading
              ? (lang === 'en' ? 'Creating...' : 'Creando...')
              : (lang === 'en' ? 'Create Group' : 'Crear Grupo')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

