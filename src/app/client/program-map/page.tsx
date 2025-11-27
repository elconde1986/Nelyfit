import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const DEMO_CLIENT_EMAIL = 'client@nelyfit.demo';

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default async function ProgramMapPage() {
  const client = await prisma.client.findFirst({
    where: { email: DEMO_CLIENT_EMAIL },
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

  const lang = (client.preferredLang as 'en' | 'es') ?? 'en';
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

  const nodes = days.map((d) => {
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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <header className="flex items-start justify-between gap-4 animate-fade-in">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 uppercase mb-1.5 tracking-wider">
              {lang === 'en' ? 'Program map' : 'Mapa del programa'}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              {program.name}
            </h1>
            {program.goal && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{program.goal}</p>
            )}
          </div>
          <Link
            href="/client/today"
            className="btn-secondary text-xs sm:text-sm shrink-0"
          >
            {lang === 'en' ? 'Back' : 'Volver'}
          </Link>
        </header>

        <p className="text-sm sm:text-base text-slate-400 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {lang === 'en'
            ? 'Each circle is a program day. Today is highlighted.'
            : 'Cada círculo es un día del programa. Hoy está resaltado.'}
        </p>

        <section className="card relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6">
            {nodes.map((n, idx) => {
              const row = Math.floor(idx / 3);
              const col = idx % 3;
              const offset = row % 2 === 0 ? col : 2 - col;
              const isCurrent = n.status === 'current';
              const isCompleted = n.status === 'completed';
              const isRest = n.status === 'rest';
              const label =
                lang === 'en'
                  ? isRest
                    ? 'Rest'
                    : `Day ${n.dayIndex}`
                  : isRest
                  ? 'Descanso'
                  : `Día ${n.dayIndex}`;

              let bg = 'bg-slate-800/60 border-slate-700';
              let shadow = '';
              if (isCurrent) {
                bg = 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-400';
                shadow = 'shadow-lg shadow-emerald-500/30 scale-110';
              } else if (isCompleted) {
                bg = 'bg-gradient-to-br from-emerald-500/30 to-emerald-500/20 border-emerald-400/60';
                shadow = 'shadow-md shadow-emerald-500/10';
              } else if (isRest) {
                bg = 'bg-slate-800/50 border-sky-400/40';
              }

              return (
                <div
                  key={n.id}
                  className={`flex flex-col items-center justify-center gap-2 col-start-${offset + 1} transition-transform duration-200 ${isCurrent ? 'z-10' : ''}`}
                >
                  <div
                    className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 flex items-center justify-center text-lg sm:text-xl font-semibold transition-all duration-200 ${bg} ${shadow}`}
                  >
                    {isRest ? '😌' : '💪'}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200">{label}</p>
                  {n.title && (
                    <p className="text-[10px] sm:text-xs text-slate-400 text-center line-clamp-2 max-w-[80px] sm:max-w-[100px]">
                      {n.title}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
