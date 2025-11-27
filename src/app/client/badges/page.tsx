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
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-md px-4 py-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase mb-1">
              {lang === 'en' ? 'Badges' : 'Logros'}
            </p>
            <h1 className="text-xl font-semibold tracking-tight">
              {lang === 'en'
                ? 'Your badge collection'
                : 'Tu colección de logros'}
            </h1>
          </div>
          <Link
            href="/client/today"
            className="text-xs border border-slate-700 rounded-lg px-3 py-1 hover:border-emerald-400"
          >
            {lang === 'en' ? 'Back' : 'Volver'}
          </Link>
        </header>

        <section className="grid grid-cols-2 gap-3">
          {Object.values(BADGE_DEFS).map((b) => {
            const isUnlocked = unlocked.has(b.id);
            const name = lang === 'en' ? b.nameEn : b.nameEs;
            const desc = lang === 'en' ? b.descriptionEn : b.descriptionEs;
            return (
              <div
                key={b.id}
                className={`rounded-2xl border p-3 text-sm ${
                  isUnlocked
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/50 opacity-60'
                }`}
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-slate-300 mt-1">{desc}</p>
                {!isUnlocked && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    {lang === 'en'
                      ? 'Locked – keep training to unlock.'
                      : 'Bloqueado – sigue entrenando para desbloquear.'}
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
