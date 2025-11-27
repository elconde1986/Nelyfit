import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const DEMO_COACH_EMAIL = 'coach@nelyfit.demo';

export default async function TemplatesPage() {
  const coach = await prisma.user.findFirst({
    where: { email: DEMO_COACH_EMAIL },
    include: { templates: true },
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Program marketplace (demo)
            </h1>
            <p className="text-slate-400 text-sm">
              This is a simplified view showing your templates. Advanced marketplace
              features can be built on top.
            </p>
          </div>
          <nav className="flex gap-2 text-xs">
            <Link
              href="/coach/dashboard"
              className="border border-slate-700 rounded-lg px-3 py-1 hover:border-emerald-400"
            >
              Dashboard
            </Link>
          </nav>
        </header>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Your templates</h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
            {coach.templates.length === 0 ? (
              <p className="text-sm text-slate-400 px-4 py-3">
                No templates yet in this demo.
              </p>
            ) : (
              <ul className="divide-y divide-slate-800 text-sm">
                {coach.templates.map((t) => (
                  <li
                    key={t.id}
                    className="px-4 py-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-slate-400">
                        {t.weeks} weeks • visibility: {t.visibility.toLowerCase()}
                      </p>
                    </div>
                    <button
                      className="text-xs rounded-lg bg-emerald-500 text-slate-950 px-3 py-1 font-medium hover:bg-emerald-400"
                    >
                      Use template (stub)
                    </button>
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
