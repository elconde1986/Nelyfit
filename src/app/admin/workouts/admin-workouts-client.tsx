'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Edit,
  Archive,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  Settings,
  Tag,
  Plus,
  Star,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';

export default function AdminWorkoutsClient({
  workouts,
  tags,
  lang,
}: {
  workouts: any[];
  tags: string[];
  lang: Lang;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch =
      workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility =
      filterVisibility === 'all' || workout.visibility === filterVisibility;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'archived' && workout.isArchived) ||
      (filterStatus === 'active' && !workout.isArchived);
    const matchesTag =
      selectedTag === 'all' || (workout.tags || []).includes(selectedTag);

    return matchesSearch && matchesVisibility && matchesStatus && matchesTag;
  });

  // Analytics
  const totalWorkouts = workouts.length;
  const activeWorkouts = workouts.filter((w) => !w.isArchived).length;
  const globalWorkouts = workouts.filter((w) => w.visibility === 'PUBLIC').length;
  const totalUsage = workouts.reduce((sum, w) => sum + w.timesUsed, 0);
  const avgCompletionRate =
    workouts.length > 0
      ? workouts.reduce((sum, w) => sum + w.completionRate, 0) / workouts.length
      : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">
                {lang === 'en' ? 'Workout Library Management' : 'Gestión de Biblioteca de Entrenamientos'}
              </span>
            </h1>
            <p className="text-slate-400 mt-1">
              {lang === 'en'
                ? 'Manage all workouts, templates, and content governance'
                : 'Gestiona todos los entrenamientos, plantillas y gobernanza de contenido'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href="/admin/workouts/tags">
                <Tag className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Manage Tags' : 'Gestionar Etiquetas'}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/workouts/create">
                <Plus className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Create Global Workout' : 'Crear Entrenamiento Global'}
              </Link>
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">
                    {lang === 'en' ? 'Total Workouts' : 'Total Entrenamientos'}
                  </p>
                  <p className="text-2xl font-bold">{totalWorkouts}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">
                    {lang === 'en' ? 'Active' : 'Activos'}
                  </p>
                  <p className="text-2xl font-bold text-emerald-400">{activeWorkouts}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">
                    {lang === 'en' ? 'Global Templates' : 'Plantillas Globales'}
                  </p>
                  <p className="text-2xl font-bold text-purple-400">{globalWorkouts}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">
                    {lang === 'en' ? 'Avg Completion' : 'Completitud Promedio'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {Math.round(avgCompletionRate)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  {lang === 'en' ? 'Search' : 'Buscar'}
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'en' ? 'Search workouts...' : 'Buscar entrenamientos...'}
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  {lang === 'en' ? 'Visibility' : 'Visibilidad'}
                </label>
                <select
                  value={filterVisibility}
                  onChange={(e) => setFilterVisibility(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                >
                  <option value="all">{lang === 'en' ? 'All' : 'Todos'}</option>
                  <option value="PRIVATE">{lang === 'en' ? 'Private' : 'Privado'}</option>
                  <option value="TEAM">{lang === 'en' ? 'Team' : 'Equipo'}</option>
                  <option value="PUBLIC">{lang === 'en' ? 'Public' : 'Público'}</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  {lang === 'en' ? 'Status' : 'Estado'}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                >
                  <option value="all">{lang === 'en' ? 'All' : 'Todos'}</option>
                  <option value="active">{lang === 'en' ? 'Active' : 'Activo'}</option>
                  <option value="archived">{lang === 'en' ? 'Archived' : 'Archivado'}</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  {lang === 'en' ? 'Tag' : 'Etiqueta'}
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                >
                  <option value="all">{lang === 'en' ? 'All Tags' : 'Todas las Etiquetas'}</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === 'en' ? 'All Workouts' : 'Todos los Entrenamientos'} (
              {filteredWorkouts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                      {lang === 'en' ? 'Workout' : 'Entrenamiento'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                      {lang === 'en' ? 'Owner' : 'Propietario'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                      {lang === 'en' ? 'Visibility' : 'Visibilidad'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                      {lang === 'en' ? 'Used' : 'Usado'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                      {lang === 'en' ? 'Completed' : 'Completado'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                      {lang === 'en' ? 'Rate' : 'Tasa'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">
                      {lang === 'en' ? 'Actions' : 'Acciones'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkouts.map((workout) => (
                    <tr
                      key={workout.id}
                      className="border-b border-slate-800 hover:bg-slate-900/30"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {workout.name}
                            {workout.isArchived && (
                              <Badge variant="warning" className="text-xs">
                                {lang === 'en' ? 'Archived' : 'Archivado'}
                              </Badge>
                            )}
                          </div>
                          {workout.description && (
                            <div className="text-xs text-slate-400 mt-1">
                              {workout.description.substring(0, 60)}...
                            </div>
                          )}
                          {workout.tags && workout.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(workout.tags as string[])
                                .filter((t) => t !== '_archived')
                                .slice(0, 3)
                                .map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {workout.coach ? (
                          <div>
                            <div className="text-sm">{workout.coach.name}</div>
                            <div className="text-xs text-slate-400">{workout.coach.email}</div>
                          </div>
                        ) : (
                          <Badge variant="default">
                            {lang === 'en' ? 'System' : 'Sistema'}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            workout.visibility === 'PUBLIC'
                              ? 'default'
                              : workout.visibility === 'TEAM'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {workout.visibility}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-semibold">{workout.timesUsed}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-semibold text-blue-400">
                          {workout.timesCompleted}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-semibold text-yellow-400">
                          {Math.round(workout.completionRate)}%
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/coach/workouts/${workout.id}`}>
                              <Eye className="w-3 h-3" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/coach/workouts/${workout.id}?mode=edit`}>
                              <Edit className="w-3 h-3" />
                            </Link>
                          </Button>
                          {workout.visibility === 'PUBLIC' && (
                            <Button variant="ghost" size="sm" title={lang === 'en' ? 'Feature template' : 'Destacar plantilla'}>
                              <Star className="w-3 h-3" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" title={lang === 'en' ? 'Deprecate' : 'Deprecar'}>
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

