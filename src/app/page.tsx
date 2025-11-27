import Link from 'next/link';
import { Dumbbell, Target, Flame, Trophy, BookOpen, User, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12">
        {/* Header */}
        <header className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4 shadow-2xl shadow-emerald-500/30 relative">
            <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 text-slate-950" strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-yellow-900" />
            </div>
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
          <Card className="group relative overflow-hidden border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <User className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <CardTitle className="text-xl">Coach Demo</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                Explore the coach experience: dashboard, inbox, clients, programs and templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/coach/dashboard">
                  Go to Coach Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-teal-500/30 hover:border-teal-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <CardTitle className="text-xl">Client Demo</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                Explore the client experience: today view with XP, streaks, badges and program map.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link href="/client/today">
                  Go to Client Today
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Card className="text-center hover:border-emerald-500/50 transition-all duration-200 hover:scale-105">
            <CardContent className="pt-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-400" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-slate-200">Gamified</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:border-orange-500/50 transition-all duration-200 hover:scale-105">
            <CardContent className="pt-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-400" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-slate-200">Streaks</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:border-yellow-500/50 transition-all duration-200 hover:scale-105">
            <CardContent className="pt-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-400" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-slate-200">Badges</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:border-blue-500/50 transition-all duration-200 hover:scale-105">
            <CardContent className="pt-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-slate-200">Programs</p>
            </CardContent>
          </Card>
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
