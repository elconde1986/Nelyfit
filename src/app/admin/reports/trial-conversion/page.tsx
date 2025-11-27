import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { TrendingUp, Users, CheckCircle, XCircle, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TrialConversionReportPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  // Get all users with trial data
  const trialUsers = await prisma.user.findMany({
    where: {
      OR: [
        { trialStart: { not: null } },
        { trialEnd: { not: null } },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      trialStart: true,
      trialEnd: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      createdAt: true,
    },
  });

  // Calculate conversion metrics
  const totalTrials = trialUsers.length;
  const activeTrials = trialUsers.filter(u => u.trialEnd && new Date() < u.trialEnd).length;
  const expiredTrials = trialUsers.filter(u => u.trialEnd && new Date() >= u.trialEnd && u.subscriptionTier === 'FREE').length;
  const converted = trialUsers.filter(u => u.subscriptionTier !== 'FREE').length;
  const conversionRate = totalTrials > 0 ? ((converted / totalTrials) * 100).toFixed(1) : '0';

  // Group by trial length
  const trialLengths = trialUsers.map(u => {
    if (!u.trialStart || !u.trialEnd) return null;
    const days = Math.ceil((u.trialEnd.getTime() - u.trialStart.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  }).filter(Boolean) as number[];

  const avgTrialLength = trialLengths.length > 0
    ? (trialLengths.reduce((a, b) => a + b, 0) / trialLengths.length).toFixed(1)
    : '0';

  // Conversion by trial length
  const conversionsByLength: Record<string, { total: number; converted: number }> = {};
  trialUsers.forEach(u => {
    if (!u.trialStart || !u.trialEnd) return;
    const days = Math.ceil((u.trialEnd.getTime() - u.trialStart.getTime()) / (1000 * 60 * 60 * 24));
    const key = days.toString();
    if (!conversionsByLength[key]) {
      conversionsByLength[key] = { total: 0, converted: 0 };
    }
    conversionsByLength[key].total++;
    if (u.subscriptionTier !== 'FREE') {
      conversionsByLength[key].converted++;
    }
  });

  // Recent conversions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentConversions = trialUsers.filter(u => {
    if (!u.trialEnd || u.subscriptionTier === 'FREE') return false;
    return u.trialEnd >= thirtyDaysAgo;
  }).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Trial Conversion Report' : 'Informe de Conversión de Pruebas'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'Analyze trial-to-paid conversion rates and trends'
              : 'Analiza las tasas de conversión de prueba a pago y tendencias'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Trials' : 'Pruebas Totales'}</p>
              <p className="text-2xl font-bold">{totalTrials}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Converted' : 'Convertidas'}</p>
              <p className="text-2xl font-bold text-emerald-400">{converted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Conversion Rate' : 'Tasa de Conversión'}</p>
              <p className="text-2xl font-bold text-blue-400">{conversionRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Avg Trial Length' : 'Duración Promedio'}</p>
              <p className="text-2xl font-bold text-purple-400">{avgTrialLength} {lang === 'en' ? 'days' : 'días'}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'en' ? 'Conversion by Trial Length' : 'Conversión por Duración'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(conversionsByLength)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([days, data]) => {
                    const rate = data.total > 0 ? ((data.converted / data.total) * 100).toFixed(1) : '0';
                    return (
                      <div key={days} className="p-3 rounded-lg bg-slate-900/60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{days} {lang === 'en' ? 'days' : 'días'}</span>
                          <Badge variant="outline">{rate}%</Badge>
                        </div>
                        <div className="text-sm text-slate-400">
                          {data.converted} / {data.total} {lang === 'en' ? 'converted' : 'convertidas'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{lang === 'en' ? 'Recent Activity' : 'Actividad Reciente'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{lang === 'en' ? 'Active Trials' : 'Pruebas Activas'}</p>
                  <p className="text-2xl font-bold text-emerald-400">{activeTrials}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">{lang === 'en' ? 'Expired (Not Converted)' : 'Expiradas (No Convertidas)'}</p>
                  <p className="text-2xl font-bold text-slate-400">{expiredTrials}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">{lang === 'en' ? 'Conversions (Last 30 Days)' : 'Conversiones (Últimos 30 Días)'}</p>
                  <p className="text-2xl font-bold text-blue-400">{recentConversions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Trial Users' : 'Usuarios de Prueba'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trialUsers.slice(0, 50).map((trialUser) => {
                const isConverted = trialUser.subscriptionTier !== 'FREE';
                const isActive = trialUser.trialEnd && new Date() < trialUser.trialEnd;
                return (
                  <div
                    key={trialUser.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      {isConverted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : isActive ? (
                        <Calendar className="w-5 h-5 text-blue-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <p className="font-semibold">{trialUser.name || trialUser.email}</p>
                        {trialUser.trialStart && trialUser.trialEnd && (
                          <p className="text-sm text-slate-400">
                            {new Date(trialUser.trialStart).toLocaleDateString()} - {new Date(trialUser.trialEnd).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={isConverted ? 'success' : isActive ? 'default' : 'default'}>
                      {isConverted
                        ? (lang === 'en' ? 'Converted' : 'Convertida')
                        : isActive
                        ? (lang === 'en' ? 'Active' : 'Activa')
                        : (lang === 'en' ? 'Expired' : 'Expirada')}
                    </Badge>
                  </div>
                );
              })}
            </div>
            {trialUsers.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No trial data found' : 'No se encontraron datos de prueba'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

