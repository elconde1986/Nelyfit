'use client';

import { useState } from 'react';
import { X, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Lang } from '@/lib/i18n';

type Photo = {
  id: string;
  photoUrl: string;
  photoType: string;
  date: string;
  notes?: string;
  createdAt: string;
};

export function PhotoDetailModal({
  photo,
  onClose,
  onDelete,
  onUpdate,
  lang,
}: {
  photo: Photo;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
  lang: Lang;
}) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    photoType: photo.photoType,
    date: new Date(photo.date).toISOString().split('T')[0],
    notes: photo.notes || '',
    sharedWithCoach: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tracking/progress-photos/${photo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setEditing(false);
        onUpdate();
      } else {
        const error = await res.json();
        alert(error.error || (lang === 'en' ? 'Failed to update' : 'Error al actualizar'));
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      alert(lang === 'en' ? 'An error occurred' : 'Ocurrió un error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {lang === 'en' ? 'Photo Details' : 'Detalles de la Foto'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden">
                <img
                  src={photo.photoUrl}
                  alt={photo.photoType}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-photo.png';
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              {editing ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">
                      {lang === 'en' ? 'Pose' : 'Pose'}
                    </label>
                    <select
                      value={formData.photoType}
                      onChange={(e) => setFormData({ ...formData, photoType: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                    >
                      <option value="front">{lang === 'en' ? 'Front' : 'Frontal'}</option>
                      <option value="side">{lang === 'en' ? 'Side' : 'Lateral'}</option>
                      <option value="back">{lang === 'en' ? 'Back' : 'Espalda'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">
                      {lang === 'en' ? 'Date' : 'Fecha'}
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">
                      {lang === 'en' ? 'Notes' : 'Notas'}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                      {saving
                        ? lang === 'en'
                          ? 'Saving...'
                          : 'Guardando...'
                        : lang === 'en'
                        ? 'Save'
                        : 'Guardar'}
                    </Button>
                    <Button variant="secondary" onClick={() => setEditing(false)}>
                      {lang === 'en' ? 'Cancel' : 'Cancelar'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {photo.photoType}
                    </Badge>
                    <p className="text-sm text-slate-400">
                      {new Date(photo.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {photo.notes && (
                      <p className="text-sm text-slate-300 mt-2">{photo.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <Button variant="secondary" onClick={() => setEditing(true)} className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      {lang === 'en' ? 'Edit' : 'Editar'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => onDelete(photo.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {lang === 'en' ? 'Delete' : 'Eliminar'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

