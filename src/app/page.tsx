import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12">
        {/* Header */}
        <header className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4 shadow-lg shadow-emerald-500/20">
            <span className="text-3xl sm:text-4xl">💪</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="gradient-text">NelyFit</span>
            <span className="text-slate-400 text-2xl sm:text-3xl lg:text-4xl ml-3">(Demo)</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto text-balance">
            Gamified fitness coaching with Duolingo-style programs, badges, streaks, and a program marketplace.
          </p>
        </header>

        {/* Demo Cards */}
        <section className="grid gap-4 sm:gap-6 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="card-hover group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">👨‍🏫</span>
                </div>
                <h2 className="font-bold text-lg sm:text-xl">Coach Demo</h2>
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Explore the coach experience: dashboard, inbox, clients, programs and templates.
              </p>
              <Link
                href="/coach/dashboard"
                className="btn-primary w-full sm:w-auto"
              >
                Go to Coach Dashboard
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>

          <div className="card-hover group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">🏃</span>
                </div>
                <h2 className="font-bold text-lg sm:text-xl">Client Demo</h2>
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Explore the client experience: today view with XP, streaks, badges and program map.
              </p>
              <Link
                href="/client/today"
                className="btn-secondary w-full sm:w-auto"
              >
                Go to Client Today
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="card text-center space-y-2">
            <div className="text-2xl sm:text-3xl mb-2">🎯</div>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Gamified</p>
          </div>
          <div className="card text-center space-y-2">
            <div className="text-2xl sm:text-3xl mb-2">🔥</div>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Streaks</p>
          </div>
          <div className="card text-center space-y-2">
            <div className="text-2xl sm:text-3xl mb-2">🏆</div>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Badges</p>
          </div>
          <div className="card text-center space-y-2">
            <div className="text-2xl sm:text-3xl mb-2">📚</div>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Programs</p>
          </div>
        </section>

        {/* Footer Note */}
        <section className="text-center text-xs sm:text-sm text-slate-500 space-y-2 pt-4 border-t border-slate-800">
          <p>
            This demo uses seeded coach and client accounts.
          </p>
          <p>
            See <code className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">README.md</code> for setup instructions.
          </p>
        </section>
      </div>
    </main>
  );
}
