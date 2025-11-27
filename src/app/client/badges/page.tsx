import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BADGE_DEFS } from '@/lib/badges';
import type { BadgeId } from '@/lib/types';

const DEMO_CLIENT_EMAIL = 'client@nelyfit.demo';

export default async function ClientBadgesPage() {
  const client = await prisma.client.findFirst({
    where: { email: DEMO_CLIENT_EMAIL },
    include: { gamification: true },
  });

  if (!client) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-300">
          Demo client not found. Run migrations and seed the DB.
        </p>
      </main>
    );
  }

  const lang = (client.preferredLang as 'en' | 'es') ?? 'en';
  const unlocked = new Set<BadgeId>((client.gamification?.badges ?? []) as BadgeId[]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <header className="flex items-start justify-between gap-4 animate-fade-in">
          <div className="flex-1">
            <p className="text-xs text-slate-400 uppercase mb-1.5 tracking-wider">
              {lang === 'en' ? 'Badges' : 'Logros'}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {lang === 'en'
                ? 'Your badge collection'
                : 'Tu colección de logros'}
            </h1>
          </div>
          <Link
            href="/client/today"
            className="btn-secondary text-xs sm:text-sm shrink-0"
          >
            {lang === 'en' ? 'Back' : 'Volver'}
          </Link>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {Object.values(BADGE_DEFS).map((b) => {
            const isUnlocked = unlocked.has(b.id);
            const name = lang === 'en' ? b.nameEn : b.nameEs;
            const desc = lang === 'en' ? b.descriptionEn : b.descriptionEs;
            return (
              <div
                key={b.id}
                className={`card text-center space-y-2 sm:space-y-3 transition-all duration-200 ${
                  isUnlocked
                    ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 hover:border-emerald-400 hover:scale-105 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/50 opacity-60 grayscale'
                }`}
              >
                <div className={`text-3xl sm:text-4xl mb-2 ${isUnlocked ? '' : 'opacity-50'}`}>
                  {b.icon}
                </div>
                <p className={`font-bold text-xs sm:text-sm ${isUnlocked ? 'text-emerald-50' : 'text-slate-400'}`}>
                  {name}
                </p>
                <p className={`text-[10px] sm:text-xs leading-relaxed ${isUnlocked ? 'text-emerald-100/90' : 'text-slate-500'}`}>
                  {desc}
                </p>
                {!isUnlocked && (
                  <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1">
                    {lang === 'en'
                      ? 'Locked'
                      : 'Bloqueado'}
                  </p>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
