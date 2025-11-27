import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { CreditCard, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const where: any = {};
  if (searchParams.status && searchParams.status !== 'all') {
    where.status = searchParams.status;
  }
  if (searchParams.search) {
    where.user = {
      OR: [
        { email: { contains: searchParams.search, mode: 'insensitive' } },
        { name: { contains: searchParams.search, mode: 'insensitive' } },
      ],
    };
  }

  const subscriptions = await prisma.subscription.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: { payments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const stats = {
    total: await prisma.subscription.count(),
    active: await prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    trialing: await prisma.subscription.count({ where: { status: 'TRIALING' } }),
    canceled: await prisma.subscription.count({ where: { status: 'CANCELED' } }),
    pastDue: await prisma.subscription.count({ where: { status: 'PAST_DUE' } }),
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
              {lang === 'en' ? 'Subscription Management' : 'Gestión de Suscripciones'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'View and manage all platform subscriptions'
              : 'Ver y gestionar todas las suscripciones de la plataforma'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total' : 'Total'}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Active' : 'Activas'}</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Trialing' : 'En Prueba'}</p>
              <p className="text-2xl font-bold text-blue-400">{stats.trialing}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Canceled' : 'Canceladas'}</p>
              <p className="text-2xl font-bold text-slate-400">{stats.canceled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Past Due' : 'Vencidas'}</p>
              <p className="text-2xl font-bold text-orange-400">{stats.pastDue}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{lang === 'en' ? 'Subscriptions' : 'Suscripciones'}</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder={lang === 'en' ? 'Search by email or name...' : 'Buscar por email o nombre...'}
                  className="w-64"
                  defaultValue={searchParams.search}
                />
                <Button variant="secondary" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  {lang === 'en' ? 'Search' : 'Buscar'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="font-semibold">{sub.user.name || sub.user.email}</p>
                        <p className="text-sm text-slate-400">{sub.user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {sub.tier}
                          </Badge>
                          {sub.currentPeriodStart && (
                            <span className="text-xs text-slate-500">
                              {lang === 'en' ? 'Period' : 'Período'}:{' '}
                              {new Date(sub.currentPeriodStart).toLocaleDateString()} -{' '}
                              {new Date(sub.currentPeriodEnd!).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge
                        variant={
                          sub.status === 'ACTIVE'
                            ? 'success'
                            : sub.status === 'TRIALING'
                            ? 'default'
                            : sub.status === 'PAST_DUE'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {sub.status}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-1">
                        {sub._count.payments} {lang === 'en' ? 'payments' : 'pagos'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {subscriptions.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No subscriptions found' : 'No se encontraron suscripciones'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

