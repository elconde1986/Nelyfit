import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { Camera } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProgressPhotosPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const photos = await prisma.progressPhoto.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { date: 'desc' },
    take: 50,
  });

  const stats = {
    total: await prisma.progressPhoto.count(),
    uniqueUsers: new Set(photos.map(p => p.userId)).size,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Progress Photos' : 'Fotos de Progreso'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'Moderate and manage progress photos'
              : 'Modera y gestiona fotos de progreso'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Photos' : 'Fotos Totales'}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Users' : 'Usuarios'}</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.uniqueUsers}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Recent Photos' : 'Fotos Recientes'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm font-semibold">{photo.user.name || photo.user.email}</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    {new Date(photo.date).toLocaleDateString()} • {photo.photoType}
                  </p>
                  {photo.notes && (
                    <p className="text-xs text-slate-500 line-clamp-2">{photo.notes}</p>
                  )}
                </div>
              ))}
            </div>
            {photos.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No photos found' : 'No se encontraron fotos'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

