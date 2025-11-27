import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { Scale } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminWeightLogsPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const weightLogs = await prisma.weightLog.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { date: 'desc' },
    take: 100,
  });

  const stats = {
    total: await prisma.weightLog.count(),
    uniqueUsers: new Set(weightLogs.map(log => log.userId)).size,
    thisMonth: weightLogs.filter(log => {
      const logDate = new Date(log.date);
      const now = new Date();
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    }).length,
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
              {lang === 'en' ? 'Weight Logs Overview' : 'Resumen de Registros de Peso'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'View all weight tracking data across the platform'
              : 'Ver todos los datos de seguimiento de peso en la plataforma'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Entries' : 'Entradas Totales'}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Users Tracking' : 'Usuarios Rastreando'}</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.uniqueUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'This Month' : 'Este Mes'}</p>
              <p className="text-2xl font-bold text-blue-400">{stats.thisMonth}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Recent Weight Logs' : 'Registros de Peso Recientes'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weightLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-semibold">{log.user.name || log.user.email}</p>
                      <p className="text-sm text-slate-400">
                        {new Date(log.date).toLocaleDateString()} • {log.weight} {log.unit}
                        {log.note && ` • ${log.note}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {weightLogs.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No weight logs found' : 'No se encontraron registros de peso'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

