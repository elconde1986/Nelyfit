import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RevenueInsightsPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  // Get all successful payments
  const payments = await prisma.payment.findMany({
    where: { status: 'SUCCEEDED' },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
      subscription: {
        select: { tier: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate revenue metrics
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalRevenueUSD = (totalRevenue / 100).toFixed(2);

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentPayments = payments.filter(p => p.createdAt >= sixMonthsAgo);

  const revenueByMonth: Record<string, number> = {};
  recentPayments.forEach(payment => {
    const monthKey = new Date(payment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!revenueByMonth[monthKey]) {
      revenueByMonth[monthKey] = 0;
    }
    revenueByMonth[monthKey] += payment.amount;
  });

  // Revenue by tier
  const revenueByTier: Record<string, number> = {};
  payments.forEach(payment => {
    const tier = payment.subscription?.tier || 'UNKNOWN';
    if (!revenueByTier[tier]) {
      revenueByTier[tier] = 0;
    }
    revenueByTier[tier] += payment.amount;
  });

  // This month's revenue
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthRevenue = payments
    .filter(p => p.createdAt >= thisMonthStart)
    .reduce((sum, p) => sum + p.amount, 0);

  // Last month's revenue
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthRevenue = payments
    .filter(p => p.createdAt >= lastMonthStart && p.createdAt <= lastMonthEnd)
    .reduce((sum, p) => sum + p.amount, 0);

  const monthOverMonth = lastMonthRevenue > 0
    ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : '0';

  // Active subscriptions revenue (MRR estimate)
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
    include: {
      payments: {
        where: { status: 'SUCCEEDED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const estimatedMRR = activeSubscriptions.reduce((sum, sub) => {
    const lastPayment = sub.payments[0];
    if (!lastPayment) return sum;
    // Estimate monthly revenue based on tier
    if (sub.tier === 'PREMIUM_MONTHLY') {
      return sum + 2999; // $29.99
    } else if (sub.tier === 'PREMIUM_ANNUAL') {
      return sum + (29999 / 12); // $299.99 / 12 months
    }
    return sum;
  }, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Revenue Insights' : 'Perspectivas de Ingresos'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'Track revenue, subscriptions, and payment trends'
              : 'Rastrea ingresos, suscripciones y tendencias de pagos'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Revenue' : 'Ingresos Totales'}</p>
              <p className="text-2xl font-bold text-emerald-400">${totalRevenueUSD}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'This Month' : 'Este Mes'}</p>
              <p className="text-2xl font-bold text-blue-400">${(thisMonthRevenue / 100).toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'MoM Growth' : 'Crecimiento Mensual'}</p>
              <p className={`text-2xl font-bold ${parseFloat(monthOverMonth) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {monthOverMonth}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Est. MRR' : 'MRR Estimado'}</p>
              <p className="text-2xl font-bold text-purple-400">${(estimatedMRR / 100).toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'en' ? 'Revenue by Month' : 'Ingresos por Mes'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(revenueByMonth)
                  .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                  .map(([month, amount]) => (
                    <div key={month} className="p-3 rounded-lg bg-slate-900/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{month}</span>
                        <span className="text-emerald-400 font-bold">${(amount / 100).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{
                            width: `${(amount / Math.max(...Object.values(revenueByMonth))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
              {Object.keys(revenueByMonth).length === 0 && (
                <p className="text-center text-slate-400 py-4">
                  {lang === 'en' ? 'No revenue data available' : 'No hay datos de ingresos disponibles'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{lang === 'en' ? 'Revenue by Tier' : 'Ingresos por Plan'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(revenueByTier)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tier, amount]) => (
                    <div key={tier} className="p-3 rounded-lg bg-slate-900/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold capitalize">{tier.toLowerCase().replace('_', ' ')}</span>
                        <span className="text-emerald-400 font-bold">${(amount / 100).toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-slate-400">
                        {((amount / totalRevenue) * 100).toFixed(1)}% {lang === 'en' ? 'of total' : 'del total'}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Recent Payments' : 'Pagos Recientes'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payments.slice(0, 50).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-semibold">{payment.user.name || payment.user.email}</p>
                      <p className="text-sm text-slate-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                        {payment.subscription && ` • ${payment.subscription.tier}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">
                      ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                    </p>
                    <Badge variant="success" className="text-xs mt-1">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {payments.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No payments found' : 'No se encontraron pagos'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

