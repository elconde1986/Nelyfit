import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, DollarSign, TrendingUp, Key, Dumbbell, Settings } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  // Get stats
  const [totalUsers, activeSubscriptions, totalRevenue, trialUsers] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.payment.aggregate({
      where: { status: 'SUCCEEDED' },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { subscriptionStatus: 'TRIALING' } }),
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Admin Dashboard</span>
            </h1>
          </div>
          <p className="text-slate-400">Manage NelsyFit platform</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <p className="text-xs text-slate-400 uppercase">Total Users</p>
              </div>
              <p className="text-3xl font-bold gradient-text">{totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                <p className="text-xs text-slate-400 uppercase">Active Subscriptions</p>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {activeSubscriptions}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <p className="text-xs text-slate-400 uppercase">Total Revenue</p>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                ${((totalRevenue._sum.amount || 0) / 100).toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                <p className="text-xs text-slate-400 uppercase">Trial Users</p>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                {trialUsers}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/codes" className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900/80 transition-colors">
                <Key className="w-4 h-4" />
                Create Temporary Code
              </Link>
              <Link href="/admin/workouts" className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900/80 transition-colors">
                <Dumbbell className="w-4 h-4" />
                Workout Library Management
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900/80 transition-colors">
                <Settings className="w-4 h-4" />
                System Settings
              </Link>
              <Link href="/admin/users" className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900/80 transition-colors">
                <Users className="w-4 h-4" />
                Manage Users
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/reports/trial-conversion" className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900/80 transition-colors">
                <TrendingUp className="w-4 h-4" />
                Trial Conversion Report
              </Link>
              <Link href="/admin/reports/revenue" className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900/80 transition-colors">
                <DollarSign className="w-4 h-4" />
                Revenue Insights
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

