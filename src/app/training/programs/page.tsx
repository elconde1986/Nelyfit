import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TrainingProgramsPage() {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Training Programs</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Browse and start fitness programs</p>
          </div>
        </header>

        <Card>
          <CardContent className="p-12 text-center">
            <Dumbbell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Training programs feature coming soon</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

