'use client';

import { useState } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lang } from '@/lib/i18n';

export function UploadPhotoDialog({
  onClose,
  onUploaded,
  lang,
}: {
  onClose: () => void;
  onUploaded: () => void;
  lang: Lang;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    photoUrl: '',
    photoType: 'front',
    date: new Date().toISOString().split('T')[0],
    weight: '',
    notes: '',
    sharedWithCoach: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('photoUrl', formData.photoUrl);
      data.append('photoType', formData.photoType);
      data.append('date', formData.date);
      if (formData.notes) data.append('notes', formData.notes);
      if (formData.sharedWithCoach) data.append('sharedWithCoach', 'true');

      const res = await fetch('/api/tracking/progress-photos', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        onUploaded();
      } else {
        const error = await res.json();
        alert(error.error || (lang === 'en' ? 'Failed to upload photo' : 'Error al subir foto'));
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(lang === 'en' ? 'An error occurred' : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              {lang === 'en' ? 'Upload Progress Photo' : 'Subir Foto de Progreso'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Photo URL' : 'URL de Foto'}
              </label>
              <Input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="bg-slate-800 border-slate-700"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en'
                  ? 'Note: For now, paste image URL. File upload coming soon.'
                  : 'Nota: Por ahora, pega la URL de la imagen. Subida de archivos próximamente.'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Pose' : 'Pose'}
              </label>
              <select
                value={formData.photoType}
                onChange={(e) => setFormData({ ...formData, photoType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                required
              >
                <option value="front">{lang === 'en' ? 'Front' : 'Frontal'}</option>
                <option value="side">{lang === 'en' ? 'Side' : 'Lateral'}</option>
                <option value="back">{lang === 'en' ? 'Back' : 'Espalda'}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Date Taken' : 'Fecha Tomada'}
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Weight (optional)' : 'Peso (opcional)'}
              </label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="70"
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">
                {lang === 'en' ? 'Notes (optional)' : 'Notas (opcional)'}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
                placeholder={lang === 'en' ? 'Add notes...' : 'Agregar notas...'}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sharedWithCoach"
                checked={formData.sharedWithCoach}
                onChange={(e) => setFormData({ ...formData, sharedWithCoach: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500"
              />
              <label htmlFor="sharedWithCoach" className="text-sm text-slate-300 cursor-pointer">
                {lang === 'en' ? 'Share with coach' : 'Compartir con entrenador'}
              </label>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                {loading
                  ? lang === 'en'
                    ? 'Uploading...'
                    : 'Subiendo...'
                  : lang === 'en'
                  ? 'Upload Photo'
                  : 'Subir Foto'}
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

