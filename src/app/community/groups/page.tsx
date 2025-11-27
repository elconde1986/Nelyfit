import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">Community Groups</span>
          </h1>
        </header>

        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Community groups feature coming soon</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

