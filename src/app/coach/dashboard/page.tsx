import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { 
  Users, 
  Flame, 
  FileText, 
  Home, 
  Mail, 
  LayoutTemplate,
  Star,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
            <div className="flex items-center gap-2 mb-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Coach view</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Welcome back, <span className="gradient-text">{coach.name ?? 'Coach'}</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Quick look at your clients, streaks and templates.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 shrink-0">
            <Button asChild variant="secondary" size="sm">
              <Link href="/coach/inbox">
                <Mail className="w-3 h-3 mr-1" />
                Inbox
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/coach/templates">
                <LayoutTemplate className="w-3 h-3 mr-1" />
                Templates
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/">
                <Home className="w-3 h-3 mr-1" />
                Home
              </Link>
            </Button>
          </nav>
        </header>

        <section className="grid gap-4 sm:gap-6 md:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Card className="group hover:border-emerald-500/50 transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <p className="text-xs text-slate-400 uppercase tracking-wider">Clients</p>
              </div>
              <p className="text-3xl sm:text-4xl font-bold gradient-text">{totalClients}</p>
            </CardContent>
          </Card>
          <Card className="group hover:border-orange-500/50 transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <p className="text-xs text-slate-400 uppercase tracking-wider">On fire</p>
              </div>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {onFire.length}
              </p>
            </CardContent>
          </Card>
          <Card className="group hover:border-teal-500/50 transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <p className="text-xs text-slate-400 uppercase tracking-wider">Templates</p>
              </div>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                {coach.templates.length}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold">Clients</h2>
          </div>
          <Card className="divide-y divide-slate-800">
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
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="font-bold text-base sm:text-lg">{c.name}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm ml-12">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          {c.gamification?.streakDays ?? 0} days
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          Level {c.gamification?.level ?? 1}
                        </Badge>
                        {c.gamification && c.gamification.streakDays >= 7 && (
                          <Badge variant="warning" className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            On Fire!
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button asChild variant="secondary" size="sm" className="shrink-0 w-full sm:w-auto">
                      <Link href="#">
                        Details
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}
