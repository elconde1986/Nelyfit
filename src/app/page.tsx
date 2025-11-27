import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">NelyFit (Demo)</h1>
          <p className="text-slate-300 text-sm">
            This is a demo build of the NelyFit concept: gamified fitness coaching with
            Duolingo-style programs, badges, streaks, chat and a program marketplace.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <h2 className="font-semibold text-lg">Coach demo</h2>
            <p className="text-sm text-slate-300">
              Explore the coach experience: dashboard, inbox, clients, programs and templates.
            </p>
            <Link
              href="/coach/dashboard"
              className="inline-flex items-center rounded-lg bg-emerald-500 text-slate-950 px-4 py-2 text-sm font-medium hover:bg-emerald-400"
            >
              Go to coach dashboard
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <h2 className="font-semibold text-lg">Client demo</h2>
            <p className="text-sm text-slate-300">
              Explore the client experience: today view with XP, streaks, badges and program map.
            </p>
            <Link
              href="/client/today"
              className="inline-flex items-center rounded-lg bg-slate-800 text-slate-50 px-4 py-2 text-sm font-medium hover:border-emerald-400 border border-slate-700"
            >
              Go to client today page
            </Link>
          </div>
        </section>

        <section className="text-xs text-slate-500 space-y-1">
          <p>
            This demo uses a seeded coach and client. Run Prisma migrations + seed before starting.
          </p>
          <p>
            See <code>README.md</code> for setup, Docker and Vercel deployment.
          </p>
        </section>
      </div>
    </main>
  );
}
