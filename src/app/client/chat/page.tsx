import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, ArrowLeft, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageToggle } from '@/components/LanguageToggle';
import { logout } from '@/app/logout/actions';
import { translations, Lang } from '@/lib/i18n';
import ChatClient from './chat-client';

export const dynamic = 'force-dynamic';

export default async function ClientChatPage() {
  const user = await requireAuth('CLIENT');
  
  if (!user || !user.clientId) {
    redirect('/login/client');
  }

  const lang = getLang();
  const t = translations.client[lang];

  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    include: {
      coach: true,
    },
  });

  if (!client || !client.coach) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-300">No coach assigned yet.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex items-center justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">Messages</span>
              </h1>
              <p className="text-slate-400 text-sm">Chat with your coach</p>
            </div>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/client/today">
              <ArrowLeft className="w-3 h-3 mr-1" />
              {t.back}
            </Link>
          </Button>
        </header>

        <ChatClient clientId={client.id} coachId={client.coach.id} lang={lang} />
      </div>
    </main>
  );
}

