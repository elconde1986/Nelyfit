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
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-md px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase mb-1">
              {lang === 'en' ? 'Program map' : 'Mapa del programa'}
            </p>
            <h1 className="text-xl font-semibold tracking-tight">
              {program.name}
            </h1>
            {program.goal && (
              <p className="text-sm text-slate-300">{program.goal}</p>
            )}
          </div>
          <Link
            href="/client/today"
            className="text-xs border border-slate-700 rounded-lg px-3 py-1 hover:border-emerald-400"
          >
            {lang === 'en' ? 'Back' : 'Volver'}
          </Link>
        </header>

        <p className="text-sm text-slate-400">
          {lang === 'en'
            ? 'Each circle is a program day. Today is highlighted.'
            : 'Cada círculo es un día del programa. Hoy está resaltado.'}
        </p>

        <section className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="grid grid-cols-3 gap-6">
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

              let bg = 'bg-slate-800 border-slate-700';
              if (isCurrent) bg = 'bg-emerald-500 border-emerald-400';
              else if (isCompleted) bg = 'bg-emerald-500/20 border-emerald-400';
              else if (isRest) bg = 'bg-slate-800/70 border-sky-400';

              return (
                <div
                  key={n.id}
                  className={`flex flex-col items-center justify-center gap-1 col-start-${offset + 1}`}
                >
                  <div
                    className={`h-14 w-14 rounded-full border flex items-center justify-center text-xs font-semibold ${bg}`}
                  >
                    {isRest ? '😌' : '💪'}
                  </div>
                  <p className="text-xs text-slate-200">{label}</p>
                  {n.title && (
                    <p className="text-[10px] text-slate-400 text-center line-clamp-2">
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
