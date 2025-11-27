import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CreateGroupClient from './create-group-client';

export const dynamic = 'force-dynamic';

export default async function CreateGroupPage() {
  const user = await requireAuth('COACH');
  if (!user) redirect('/login/coach');

  const lang = getLang();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <header className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/community/groups">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Back to Groups' : 'Volver a Grupos'}
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Create Group' : 'Crear Grupo'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'Create a new community group for your clients'
              : 'Crea un nuevo grupo comunitario para tus clientes'}
          </p>
        </header>

        <CreateGroupClient lang={lang} coachId={user.id} />
      </div>
    </main>
  );
}

