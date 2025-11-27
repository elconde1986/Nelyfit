import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTrialsPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  // Get all users with active or recent trials
  const trialUsers = await prisma.user.findMany({
    where: {
      OR: [
        { trialEnd: { gte: new Date() } }, // Active trials
        { trialEnd: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // Recent trials (last 30 days)
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      trialStart: true,
      trialEnd: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      createdAt: true,
    },
    orderBy: { trialStart: 'desc' },
    take: 100,
  });

  const stats = {
    active: trialUsers.filter(u => u.trialEnd && new Date() < u.trialEnd).length,
    expired: trialUsers.filter(u => u.trialEnd && new Date() >= u.trialEnd).length,
    converted: trialUsers.filter(u => u.subscriptionTier !== 'FREE').length,
  };

  const getTrialStatus = (user: any) => {
    if (!user.trialEnd) return { label: 'No Trial', variant: 'default' as const };
    if (new Date() < user.trialEnd) {
      const daysRemaining = Math.ceil((user.trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return { label: `${daysRemaining} days left`, variant: 'success' as const };
    }
    return { label: 'Expired', variant: 'default' as const };
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
              {lang === 'en' ? 'Trial Management' : 'Gestión de Pruebas'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'Monitor and manage trial accounts'
              : 'Monitorea y gestiona cuentas de prueba'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Active Trials' : 'Pruebas Activas'}</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Expired' : 'Expiradas'}</p>
              <p className="text-2xl font-bold text-slate-400">{stats.expired}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Converted' : 'Convertidas'}</p>
              <p className="text-2xl font-bold text-blue-400">{stats.converted}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Trial Accounts' : 'Cuentas de Prueba'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trialUsers.map((trialUser) => {
                const status = getTrialStatus(trialUser);
                const isConverted = trialUser.subscriptionTier !== 'FREE';
                return (
                  <div
                    key={trialUser.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {isConverted ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-400" />
                        )}
                        <div>
                          <p className="font-semibold">{trialUser.name || trialUser.email}</p>
                          <p className="text-sm text-slate-400">{trialUser.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {trialUser.role}
                            </Badge>
                            {trialUser.trialStart && trialUser.trialEnd && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(trialUser.trialStart).toLocaleDateString()} - {new Date(trialUser.trialEnd).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {isConverted && (
                        <Badge variant="success" className="text-xs">
                          {lang === 'en' ? 'Converted' : 'Convertida'}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {trialUsers.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No trial accounts found' : 'No se encontraron cuentas de prueba'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

