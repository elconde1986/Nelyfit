'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Play,
  Star,
  Youtube,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';
import { createCoachVideo, updateCoachVideo, archiveCoachVideo, setPrimaryVideo } from './actions';

export default function ExerciseVideosClient({
  exercise,
  coachVideos,
  coachId,
  lang,
}: {
  exercise: any;
  coachVideos: any[];
  coachId: string;
  lang: Lang;
}) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    videoUrl: '',
    title: '',
    description: '',
    language: 'en',
    variantType: 'TUTORIAL',
    isPrimary: false,
  });

  const handleAddVideo = async () => {
    if (!formData.videoUrl.trim() || !formData.title.trim()) {
      alert(lang === 'en' ? 'Please fill in all required fields' : 'Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const result = await createCoachVideo({
        exerciseId: exercise.id,
        ...formData,
      });

      if (result.success) {
        setShowAddForm(false);
        setFormData({
          videoUrl: '',
          title: '',
          description: '',
          language: 'en',
          variantType: 'TUTORIAL',
          isPrimary: false,
        });
        router.refresh();
      } else {
        alert(result.error || (lang === 'en' ? 'Failed to add video' : 'Error al agregar video'));
      }
    } catch (error) {
      console.error('Error adding video:', error);
      alert(lang === 'en' ? 'Failed to add video' : 'Error al agregar video');
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (videoId: string) => {
    setSaving(true);
    try {
      const result = await setPrimaryVideo(videoId);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error setting primary video:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (videoId: string) => {
    if (!confirm(lang === 'en' ? 'Archive this video?' : '¿Archivar este video?')) {
      return;
    }

    setSaving(true);
    try {
      const result = await archiveCoachVideo(videoId);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error archiving video:', error);
    } finally {
      setSaving(false);
    }
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (videoUrl: string) => {
    const videoId = extractYouTubeId(videoUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/coach/workouts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Back' : 'Atrás'}
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">{exercise.name}</span>
              </h1>
              <p className="text-slate-400 mt-1">
                {lang === 'en' ? 'Manage Technique Videos' : 'Gestionar Videos de Técnica'}
              </p>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Add Video' : 'Agregar Video'}
          </Button>
        </div>

        {/* Default Video */}
        {exercise.defaultVideoUrl && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="w-5 h-5" />
                {lang === 'en' ? 'Default Video' : 'Video Predeterminado'}
              </CardTitle>
              <CardDescription>
                {lang === 'en'
                  ? 'Platform-wide demo video (read-only)'
                  : 'Video de demostración de la plataforma (solo lectura)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(exercise.defaultVideoUrl)}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coach Videos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {lang === 'en' ? 'Your Videos' : 'Tus Videos'} ({coachVideos.length})
            </CardTitle>
            <CardDescription>
              {lang === 'en'
                ? 'Videos that your clients will see for this exercise'
                : 'Videos que tus clientes verán para este ejercicio'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {coachVideos.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                {lang === 'en'
                  ? 'No videos added yet. Click "Add Video" to get started.'
                  : 'Aún no hay videos. Haz clic en "Agregar Video" para comenzar.'}
              </div>
            ) : (
              <div className="space-y-4">
                {coachVideos.map((video) => {
                  const thumbnail = getThumbnailUrl(video.videoUrl);
                  return (
                    <div
                      key={video.id}
                      className="p-4 rounded-lg bg-slate-900/60 border border-slate-700"
                    >
                      <div className="flex gap-4">
                        {thumbnail && (
                          <div className="w-48 h-32 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                            <img
                              src={thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold flex items-center gap-2">
                                {video.title}
                                {video.isPrimary && (
                                  <Badge variant="default" className="text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    {lang === 'en' ? 'Primary' : 'Principal'}
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-sm text-slate-400 mt-1">{video.description}</p>
                            </div>
                            <div className="flex gap-2">
                              {!video.isPrimary && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetPrimary(video.id)}
                                  disabled={saving}
                                >
                                  <Star className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchive(video.id)}
                                disabled={saving}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {video.variantType}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {video.language.toUpperCase()}
                            </Badge>
                          </div>
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 mt-2"
                          >
                            <Play className="w-3 h-3" />
                            {lang === 'en' ? 'Watch on YouTube' : 'Ver en YouTube'}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Video Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{lang === 'en' ? 'Add YouTube Video' : 'Agregar Video de YouTube'}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        videoUrl: '',
                        title: '',
                        description: '',
                        language: 'en',
                        variantType: 'TUTORIAL',
                        isPrimary: false,
                      });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    {lang === 'en' ? 'YouTube URL' : 'URL de YouTube'} *
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    {lang === 'en' ? 'Title' : 'Título'} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={lang === 'en' ? 'e.g., Coach Nely - Goblet Squat Basics' : 'ej., Coach Nely - Sentadilla Goblet Básica'}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    {lang === 'en' ? 'Description' : 'Descripción'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder={lang === 'en' ? 'Coaching emphasis, key points...' : 'Énfasis del entrenamiento, puntos clave...'}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      {lang === 'en' ? 'Language' : 'Idioma'}
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      {lang === 'en' ? 'Variant Type' : 'Tipo de Variante'}
                    </label>
                    <select
                      value={formData.variantType}
                      onChange={(e) => setFormData({ ...formData, variantType: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                    >
                      <option value="TUTORIAL">{lang === 'en' ? 'Tutorial' : 'Tutorial'}</option>
                      <option value="QUICK_CUE">{lang === 'en' ? 'Quick Cue' : 'Indicación Rápida'}</option>
                      <option value="REGRESSION">{lang === 'en' ? 'Regression' : 'Regresión'}</option>
                      <option value="ADVANCED">{lang === 'en' ? 'Advanced' : 'Avanzado'}</option>
                      <option value="WARMUP">{lang === 'en' ? 'Warmup' : 'Calentamiento'}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      {lang === 'en' ? 'Set as primary video' : 'Establecer como video principal'}
                    </span>
                  </label>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'en'
                      ? 'Primary video will be shown to clients by default'
                      : 'El video principal se mostrará a los clientes por defecto'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddVideo} disabled={saving} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? (lang === 'en' ? 'Adding...' : 'Agregando...') : (lang === 'en' ? 'Add Video' : 'Agregar Video')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        videoUrl: '',
                        title: '',
                        description: '',
                        language: 'en',
                        variantType: 'TUTORIAL',
                        isPrimary: false,
                      });
                    }}
                  >
                    {lang === 'en' ? 'Cancel' : 'Cancelar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

