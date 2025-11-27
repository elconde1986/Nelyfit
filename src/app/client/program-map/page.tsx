import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { MapPin, ArrowLeft, Dumbbell, Coffee, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { translations, Lang } from '@/lib/i18n';
import { ProgramMapInteractive } from './program-map-interactive';

export const dynamic = 'force-dynamic';

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default async function ProgramMapPage() {
  const user = await requireAuth('CLIENT');
  
  if (!user || !user.clientId) {
    redirect('/login/client');
  }

  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    include: {
      currentProgram: {
        include: {
          days: { orderBy: { dayIndex: 'asc' } },
        },
      },
      logs: true,
    },
  });

  if (!client || !client.currentProgram) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-300">
          Demo client has no current program. Seed the DB or assign one via Prisma Studio.
        </p>
      </main>
    );
  }

  const lang = getLang();
  const t = translations.client[lang];
  const program = client.currentProgram;
  const days = program.days;

  const logByDayIndex = new Map<number, { completed: boolean }>();
  if (client.programStartDate) {
    const start = startOfDay(client.programStartDate);
    for (const log of client.logs) {
      const logDay = startOfDay(log.date);
      const diffDays =
        Math.floor((logDay.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays >= 1) {
        const completed = log.workoutCompleted || log.habitsCompleted.length > 0;
        const prev = logByDayIndex.get(diffDays);
        logByDayIndex.set(diffDays, { completed: prev ? prev.completed || completed : completed });
      }
    }
  }

  const today = startOfDay(new Date());
  const currentDayIndex =
    client.programStartDate && days.length > 0
      ? Math.min(
          days.length,
          Math.max(
            1,
            Math.floor(
              (today.getTime() - startOfDay(client.programStartDate).getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1,
          ),
        )
      : null;

  type Status = 'completed' | 'current' | 'locked' | 'rest';

  const nodes = days.map((d: any) => {
    let status: Status = 'locked';
    const log = logByDayIndex.get(d.dayIndex);
    const isRest = d.isRestDay;

    if (isRest) status = 'rest';
    if (log?.completed) status = 'completed';
    else if (currentDayIndex && d.dayIndex === currentDayIndex) status = 'current';

    return {
      id: d.id,
      dayIndex: d.dayIndex,
      title: d.title,
      isRest,
      status,
    };
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top pb-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex items-start justify-between gap-4 animate-fade-in">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                {t.programMap}
              </p>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              {program.name}
            </h1>
            {program.goal && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{program.goal}</p>
            )}
          </div>
          <Button asChild variant="secondary" size="sm" className="shrink-0">
            <Link href="/client/today">
              <ArrowLeft className="w-3 h-3 mr-1" />
              {t.back}
            </Link>
          </Button>
        </header>

        <p className="text-sm sm:text-base text-slate-400 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {lang === 'en'
            ? 'Click any day to view details and start/resume workouts. Today is highlighted.'
            : 'Haz clic en cualquier día para ver detalles e iniciar/continuar entrenamientos. Hoy está resaltado.'}
        </p>

        <Card className="relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="pt-6">
            <ProgramMapInteractive
              nodes={nodes}
              programStartDate={client.programStartDate}
              lang={lang}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
