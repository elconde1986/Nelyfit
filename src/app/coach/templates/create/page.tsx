import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FilePlus, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { logout } from '@/app/logout/actions';
import { translations, Lang } from '@/lib/i18n';
import CreateTemplateClient from './create-template-client';

export const dynamic = 'force-dynamic';

export default async function CreateTemplatePage() {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();
  const t = translations.coach[lang];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex items-center justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
              <FilePlus className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">Create Template</span>
              </h1>
              <p className="text-slate-400 text-sm">Build a reusable program template</p>
            </div>
          </div>
          <nav className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/coach/templates">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back
              </Link>
            </Button>
          </nav>
        </header>

        <CreateTemplateClient coachId={user.id} lang={lang} />
      </div>
    </main>
  );
}

