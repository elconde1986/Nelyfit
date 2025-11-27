'use client';

import { useState, useEffect } from 'react';
import { Camera, Upload, Grid, Calendar, Filter, X, Edit, Trash2, Eye, EyeOff, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Lang } from '@/lib/i18n';
import { UploadPhotoDialog } from './upload-photo-dialog';
import { PhotoDetailModal } from './photo-detail-modal';

type Photo = {
  id: string;
  photoUrl: string;
  photoType: string;
  date: string;
  notes?: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export function ProgressPhotosClient({ userId, lang }: { userId: string; lang: Lang }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [filters, setFilters] = useState({
    pose: '',
    startDate: '',
    endDate: '',
  });

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.pose) params.append('pose', filters.pose);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/tracking/progress-photos?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [filters]);

  const handleDelete = async (photoId: string) => {
    if (!confirm(lang === 'en' ? 'Delete this photo?' : '¿Eliminar esta foto?')) return;

    try {
      const res = await fetch(`/api/tracking/progress-photos/${photoId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== photoId));
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(null);
        }
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert(lang === 'en' ? 'Failed to delete photo' : 'Error al eliminar foto');
    }
  };

  const groupedByMonth = photos.reduce((acc, photo) => {
    const month = new Date(photo.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric',
      month: 'long',
    });
    if (!acc[month]) acc[month] = [];
    acc[month].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Progress Photos' : 'Fotos de Progreso'}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'en'
              ? 'Track your visual progress over time'
              : 'Rastrea tu progreso visual con el tiempo'}
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4 mr-2" />
          {lang === 'en' ? 'Upload Photo' : 'Subir Foto'}
        </Button>
      </header>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {lang === 'en' ? 'Filters' : 'Filtros'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4 mr-1" />
                {lang === 'en' ? 'Grid' : 'Cuadrícula'}
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('timeline')}
              >
                <Calendar className="w-4 h-4 mr-1" />
                {lang === 'en' ? 'Timeline' : 'Línea de Tiempo'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                {lang === 'en' ? 'Pose' : 'Pose'}
              </label>
              <select
                value={filters.pose}
                onChange={(e) => setFilters({ ...filters, pose: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 text-sm"
              >
                <option value="">{lang === 'en' ? 'All' : 'Todos'}</option>
                <option value="front">{lang === 'en' ? 'Front' : 'Frontal'}</option>
                <option value="side">{lang === 'en' ? 'Side' : 'Lateral'}</option>
                <option value="back">{lang === 'en' ? 'Back' : 'Espalda'}</option>
              </select>
            </div>
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
                onClick={() => setFilters({ pose: '', startDate: '', endDate: '' })}
                className="w-full"
              >
                <X className="w-4 h-4 mr-1" />
                {lang === 'en' ? 'Clear' : 'Limpiar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos Display */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          {lang === 'en' ? 'Loading photos...' : 'Cargando fotos...'}
        </div>
      ) : photos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">
              {lang === 'en'
                ? 'No progress photos yet. Upload your first photo to start tracking!'
                : 'Aún no hay fotos de progreso. ¡Sube tu primera foto para comenzar!'}
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              {lang === 'en' ? 'Upload First Photo' : 'Subir Primera Foto'}
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className="cursor-pointer hover:border-emerald-500/50 transition-colors overflow-hidden"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-square relative bg-slate-900">
                <img
                  src={photo.photoUrl}
                  alt={photo.photoType}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-photo.png';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {photo.photoType}
                  </Badge>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-slate-200 bg-black/60 px-2 py-1 rounded">
                    {new Date(photo.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByMonth).map(([month, monthPhotos]) => (
            <div key={month}>
              <h2 className="text-lg font-bold mb-4 text-slate-300">{month}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {monthPhotos.map((photo) => (
                  <Card
                    key={photo.id}
                    className="cursor-pointer hover:border-emerald-500/50 transition-colors overflow-hidden"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="aspect-square relative bg-slate-900">
                      <img
                        src={photo.photoUrl}
                        alt={photo.photoType}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-photo.png';
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {photo.photoType}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      {showUpload && (
        <UploadPhotoDialog
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            fetchPhotos();
          }}
          lang={lang}
        />
      )}

      {/* Detail Modal */}
      {selectedPhoto && (
        <PhotoDetailModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={handleDelete}
          onUpdate={() => fetchPhotos()}
          lang={lang}
        />
      )}
    </div>
  );
}

