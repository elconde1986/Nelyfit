import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Check } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import BillingClient from './billing-client';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { payments: { orderBy: { createdAt: 'desc' }, take: 10 } },
  });

  const isTrialActive = user.trialEnd && new Date() < user.trialEnd;
  const trialDaysRemaining = user.trialEnd
    ? Math.ceil((user.trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">Billing & Subscription</span>
          </h1>
        </header>

        {isTrialActive && (
          <Card className="mb-6 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-lg">NelsyFit Premium Trial Active</p>
                  <p className="text-sm text-slate-300">
                    {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <BillingClient user={user} subscription={subscription} lang={lang} />
      </div>
    </main>
  );
}

