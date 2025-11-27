import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Mail, ArrowLeft, Send, MessageSquare, User, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle } from '@/components/LanguageToggle';
import { logout } from '@/app/logout/actions';
import { translations, Lang } from '@/lib/i18n';
import InboxClient from './inbox-client';

export const dynamic = 'force-dynamic';

export default async function CoachInboxPage() {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();
  const t = translations.coach[lang];

  const coach = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      coachedClients: {
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          user: true,
        },
      },
    },
  });

  if (!coach) {
    redirect('/login/coach');
  }

  // Get unread message counts per client
  const clientsWithUnread = await Promise.all(
    coach.coachedClients.map(async (client) => {
      const unreadCount = await prisma.chatMessage.count({
        where: {
          clientId: client.id,
          coachId: coach.id,
          sender: 'CLIENT',
          readAt: null,
        },
      });
      return { ...client, unreadCount };
    })
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Mail className="w-5 h-5 text-emerald-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">{t.inbox}</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              <span className="gradient-text">{t.inbox}</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Messages from your clients
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 shrink-0">
            <Button asChild variant="secondary" size="sm">
              <a href="/coach/dashboard">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Dashboard
              </a>
            </Button>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="w-3 h-3 mr-1" />
                {t.logout}
              </Button>
            </form>
          </nav>
        </header>

        <InboxClient clients={clientsWithUnread} coachId={coach.id} lang={lang} />
      </div>
    </main>
  );
}

