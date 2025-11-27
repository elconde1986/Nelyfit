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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 animate-fade-in">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Program <span className="gradient-text">Marketplace</span>
              <span className="text-slate-400 text-lg sm:text-xl ml-2">(Demo)</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              This is a simplified view showing your templates. Advanced marketplace
              features can be built on top.
            </p>
          </div>
          <nav className="flex gap-2 shrink-0">
            <Link
              href="/coach/dashboard"
              className="btn-secondary text-xs sm:text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="btn-secondary text-xs sm:text-sm"
            >
              Home
            </Link>
          </nav>
        </header>

        <section className="space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg sm:text-xl font-bold">Your Templates</h2>
          <div className="card divide-y divide-slate-800">
            {coach.templates.length === 0 ? (
              <p className="text-sm sm:text-base text-slate-400 px-4 sm:px-6 py-6 sm:py-8 text-center">
                No templates yet in this demo.
              </p>
            ) : (
              <ul className="text-sm sm:text-base">
                {coach.templates.map((t) => (
                  <li
                    key={t.id}
                    className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-900/40 transition-colors duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base sm:text-lg mb-1">{t.name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400">
                        <span>{t.weeks} weeks</span>
                        <span>•</span>
                        <span className="capitalize">{t.visibility.toLowerCase()}</span>
                      </div>
                    </div>
                    <button
                      className="btn-primary text-xs sm:text-sm shrink-0 w-full sm:w-auto"
                    >
                      Use Template
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
