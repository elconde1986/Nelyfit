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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 animate-fade-in">
          <div className="flex-1">
            <p className="text-xs text-slate-400 uppercase mb-1.5 tracking-wider">Coach view</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Welcome back, <span className="gradient-text">{coach.name ?? 'Coach'}</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Quick look at your clients, streaks and templates.
            </p>
          </div>
          <nav className="flex gap-2 shrink-0">
            <Link
              href="/coach/inbox"
              className="btn-secondary text-xs sm:text-sm"
            >
              Inbox
            </Link>
            <Link
              href="/coach/templates"
              className="btn-secondary text-xs sm:text-sm"
            >
              Templates
            </Link>
            <Link
              href="/"
              className="btn-secondary text-xs sm:text-sm"
            >
              Home
            </Link>
          </nav>
        </header>

        <section className="grid gap-4 sm:gap-6 md:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="card group hover:border-emerald-500/50 transition-all duration-200">
            <p className="text-xs text-slate-400 uppercase mb-2 tracking-wider">Clients</p>
            <p className="text-3xl sm:text-4xl font-bold gradient-text">{totalClients}</p>
          </div>
          <div className="card group hover:border-orange-500/50 transition-all duration-200">
            <p className="text-xs text-slate-400 uppercase mb-2 tracking-wider flex items-center gap-1">
              On fire <span className="text-base">🔥</span>
            </p>
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {onFire.length}
            </p>
          </div>
          <div className="card group hover:border-teal-500/50 transition-all duration-200">
            <p className="text-xs text-slate-400 uppercase mb-2 tracking-wider">Templates</p>
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {coach.templates.length}
            </p>
          </div>
        </section>

        <section className="space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg sm:text-xl font-bold">Clients</h2>
          <div className="card divide-y divide-slate-800">
            {coach.coachedClients.length === 0 ? (
              <p className="text-sm text-slate-400 px-4 py-6 text-center">
                No demo clients yet. Seed the DB.
              </p>
            ) : (
              <ul className="text-sm">
                {coach.coachedClients.map((c) => (
                  <li
                    key={c.id}
                    className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-900/40 transition-colors duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base sm:text-lg mb-1">{c.name}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <span>🔥</span>
                          <span>Streak: {c.gamification?.streakDays ?? 0} days</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>⭐</span>
                          <span>Level {c.gamification?.level ?? 1}</span>
                        </span>
                      </div>
                    </div>
                    <Link
                      href="#"
                      className="btn-secondary text-xs sm:text-sm shrink-0 w-full sm:w-auto text-center"
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
