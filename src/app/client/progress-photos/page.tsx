import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ProgressPhotosClient } from './progress-photos-client';

export const dynamic = 'force-dynamic';

export default async function ProgressPhotosPage() {
  const user = await requireAuth('CLIENT');
  if (!user) redirect('/login/client');

  const lang = getLang();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <ProgressPhotosClient userId={user.id} lang={lang} />
      </div>
    </main>
  );
}

