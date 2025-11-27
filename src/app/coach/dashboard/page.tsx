import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const DEMO_COACH_EMAIL = 'coach@nelyfit.demo';

export default async function CoachDashboardPage() {
  const coach = await prisma.user.findFirst({
    where: { email: DEMO_COACH_EMAIL },
    include: {
      coachedClients: {
        include: { gamification: true },
      },
      templates: true,
    },
  });

  if (!coach) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-300">
          Demo coach not found. Run migrations and seed the DB.
        </p>
      </main>
    );
  }

  const totalClients = coach.coachedClients.length;
  const onFire = coach.coachedClients.filter(
    (c) => c.gamification && c.gamification.streakDays >= 7,
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase mb-1">Coach view</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {coach.name ?? 'Coach'}
            </h1>
            <p className="text-sm text-slate-400">
              Quick look at your clients, streaks and templates.
            </p>
          </div>
          <nav className="flex gap-2 text-xs">
            <Link
              href="/coach/inbox"
              className="border border-slate-700 rounded-lg px-3 py-1 hover:border-emerald-400"
            >
              Inbox
            </Link>
            <Link
              href="/coach/templates"
              className="border border-slate-700 rounded-lg px-3 py-1 hover:border-emerald-400"
            >
              Templates
            </Link>
          </nav>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
            <p className="text-xs text-slate-400 uppercase mb-1">Clients</p>
            <p className="text-2xl font-semibold">{totalClients}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
            <p className="text-xs text-slate-400 uppercase mb-1">On fire 🔥</p>
            <p className="text-2xl font-semibold">{onFire.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
            <p className="text-xs text-slate-400 uppercase mb-1">Templates</p>
            <p className="text-2xl font-semibold">{coach.templates.length}</p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Clients</h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
            {coach.coachedClients.length === 0 ? (
              <p className="text-sm text-slate-400 px-4 py-3">
                No demo clients yet. Seed the DB.
              </p>
            ) : (
              <ul className="divide-y divide-slate-800 text-sm">
                {coach.coachedClients.map((c) => (
                  <li
                    key={c.id}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-slate-400">
                        Streak: {c.gamification?.streakDays ?? 0} days • Level{' '}
                        {c.gamification?.level ?? 1}
                      </p>
                    </div>
                    <Link
                      href="#"
                      className="text-xs border border-slate-700 rounded-lg px-3 py-1 hover:border-emerald-400"
                    >
                      Details (demo)
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
