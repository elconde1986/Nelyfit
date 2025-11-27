import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Calendar, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProgramsPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const programs = await prisma.program.findMany({
    include: {
      coach: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { clients: true, days: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const stats = {
    total: programs.length,
    active: programs.filter(p => p.status === 'ACTIVE').length,
    archived: programs.filter(p => p.status === 'ARCHIVED').length,
    totalClients: programs.reduce((sum, p) => sum + p._count.clients, 0),
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
              {lang === 'en' ? 'Program Management' : 'Gestión de Programas'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'View and manage all training programs'
              : 'Ver y gestiona todos los programas de entrenamiento'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Programs' : 'Programas Totales'}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Active' : 'Activos'}</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Archived' : 'Archivados'}</p>
              <p className="text-2xl font-bold text-slate-400">{stats.archived}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Clients' : 'Clientes Totales'}</p>
              <p className="text-2xl font-bold text-purple-400">{stats.totalClients}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'All Programs' : 'Todos los Programas'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-semibold">{program.name}</p>
                      <p className="text-sm text-slate-400">
                        {program.coach?.name || program.coach?.email || 'No coach'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{program.totalWeeks} {lang === 'en' ? 'weeks' : 'semanas'}</span>
                        <span>•</span>
                        <span>{program._count.days} {lang === 'en' ? 'days' : 'días'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {program._count.clients} {lang === 'en' ? 'clients' : 'clientes'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={program.status === 'ACTIVE' ? 'success' : 'default'}>
                    {program.status}
                  </Badge>
                </div>
              ))}
            </div>
            {programs.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No programs found' : 'No se encontraron programas'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

