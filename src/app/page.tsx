import { cookies } from 'next/headers';
import Link from 'next/link';
import { Dumbbell, User, Users, Sparkles, ArrowRight, Target, Flame, Trophy, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle } from '@/components/LanguageToggle';
import { translations, Lang } from '@/lib/i18n';

export default async function LandingPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Lang) || 'en';
  const t = translations.landing[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        {/* Hero Section */}
        <header className="text-center space-y-6 mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-6 shadow-2xl shadow-emerald-500/30 relative">
            <Dumbbell className="w-12 h-12 sm:w-14 sm:h-14 text-slate-950" strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-900" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {t.title}
            </span>
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto text-balance">
            {t.subtitle}
          </p>
        </header>

        {/* Login Options */}
        <section className="grid gap-6 sm:gap-8 md:grid-cols-2 max-w-4xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Card className="group relative overflow-hidden border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <CardHeader className="text-center pb-4 relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <User className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <CardTitle className="text-2xl mb-2">{t.coachTitle}</CardTitle>
              <CardDescription className="text-slate-300">
                {t.coachDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Link href="/login/coach" className="block">
                  <Button className="w-full" size="lg">
                    {t.coachLogin}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/signup" className="block">
                  <Button variant="ghost" className="w-full" size="sm">
                    New? Sign Up
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-center text-slate-500">
                {t.demoCoach}
            </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-teal-500/30 hover:border-teal-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <CardHeader className="text-center pb-4 relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Users className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <CardTitle className="text-2xl mb-2">{t.clientTitle}</CardTitle>
              <CardDescription className="text-slate-300">
                {t.clientDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Link href="/login/client" className="block">
                  <Button variant="secondary" className="w-full" size="lg">
                    {t.clientLogin}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/signup" className="block">
                  <Button variant="ghost" className="w-full" size="sm">
                    New? Sign Up
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-center text-slate-500">
                {t.demoClient}
            </p>
            </CardContent>
          </Card>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Card className="text-center hover:border-emerald-500/50 transition-all duration-200 hover:scale-105">
            <CardContent className="pt-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                <Target className="w-7 h-7 text-emerald-400" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-slate-200">{t.gamified}</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:border-orange-500/50 transition-all duration-200 hover:scale-105">
            <CardContent className="pt-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center">
                <Flame className="w-7 h-7 text-orange-400" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-slate-200">{t.streaks}</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:border-yellow-500/50 transition-all duration-200 hover:scale-105">
            <CardContent className="pt-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-yellow-400" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-slate-200">{t.badges}</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:border-blue-500/50 transition-all duration-200 hover:scale-105">
            <CardContent className="pt-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-blue-400" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-slate-200">{t.programs}</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
