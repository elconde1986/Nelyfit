'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Tag,
  Search,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { translations, Lang } from '@/lib/i18n';

export default function TagManagementClient({
  tags,
  lang,
}: {
  tags: Array<{ name: string; usageCount: number }>;
  lang: Lang;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    // In a full implementation, this would call a server action
    alert(lang === 'en' ? 'Tag creation will be implemented' : 'La creación de etiquetas se implementará');
    setNewTagName('');
  };

  const handleEditTag = (tagName: string) => {
    setEditingTag(tagName);
    setEditName(tagName);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editingTag) return;
    // In a full implementation, this would call a server action to rename tag across all workouts
    alert(lang === 'en' ? 'Tag editing will be implemented' : 'La edición de etiquetas se implementará');
    setEditingTag(null);
    setEditName('');
  };

  const handleDeleteTag = async (tagName: string) => {
    if (!confirm(lang === 'en' ? `Delete tag "${tagName}"?` : `¿Eliminar etiqueta "${tagName}"?`)) {
      return;
    }
    // In a full implementation, this would call a server action to remove tag from all workouts
    alert(lang === 'en' ? 'Tag deletion will be implemented' : 'La eliminación de etiquetas se implementará');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/workouts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Back' : 'Atrás'}
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">
                  {lang === 'en' ? 'Tag & Category Management' : 'Gestión de Etiquetas y Categorías'}
                </span>
              </h1>
              <p className="text-slate-400 mt-1">
                {lang === 'en'
                  ? 'Manage workout tags and categories'
                  : 'Gestiona etiquetas y categorías de entrenamientos'}
              </p>
            </div>
          </div>
        </div>

        {/* Create New Tag */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {lang === 'en' ? 'Create New Tag' : 'Crear Nueva Etiqueta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder={lang === 'en' ? 'Tag name...' : 'Nombre de etiqueta...'}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateTag();
                  }
                }}
              />
              <Button onClick={handleCreateTag}>
                {lang === 'en' ? 'Create' : 'Crear'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'en' ? 'Search tags...' : 'Buscar etiquetas...'}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              {lang === 'en' ? 'All Tags' : 'Todas las Etiquetas'} ({filteredTags.length})
            </CardTitle>
            <CardDescription>
              {lang === 'en'
                ? 'Tags used across all workouts'
                : 'Etiquetas utilizadas en todos los entrenamientos'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredTags.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  {lang === 'en' ? 'No tags found' : 'No se encontraron etiquetas'}
                </p>
              ) : (
                filteredTags
                  .sort((a, b) => b.usageCount - a.usageCount)
                  .map((tag) => (
                    <div
                      key={tag.name}
                      className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg hover:bg-slate-900/80"
                    >
                      <div className="flex items-center gap-3">
                        <Tag className="w-4 h-4 text-slate-400" />
                        {editingTag === tag.name ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-50"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit();
                              } else if (e.key === 'Escape') {
                                setEditingTag(null);
                                setEditName('');
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="font-semibold">{tag.name}</span>
                        )}
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {tag.usageCount} {lang === 'en' ? 'uses' : 'usos'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {editingTag === tag.name ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSaveEdit}
                            >
                              {lang === 'en' ? 'Save' : 'Guardar'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTag(null);
                                setEditName('');
                              }}
                            >
                              {lang === 'en' ? 'Cancel' : 'Cancelar'}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTag(tag.name)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTag(tag.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

