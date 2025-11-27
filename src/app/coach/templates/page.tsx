import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { LayoutTemplate, Home, ArrowLeft, FileText, Calendar, Eye, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const coach = await prisma.user.findUnique({
    where: { id: user.id },
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
            <div className="flex items-center gap-2 mb-1.5">
              <LayoutTemplate className="w-5 h-5 text-emerald-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">Templates</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Program <span className="gradient-text">Marketplace</span>
              <span className="text-slate-400 text-lg sm:text-xl ml-2">(Demo)</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              This is a simplified view showing your templates. Advanced marketplace
              features can be built on top.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 shrink-0">
            <Button asChild variant="secondary" size="sm">
              <Link href="/coach/dashboard">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Dashboard
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

        <section className="space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-bold">Your Templates</h2>
            </div>
            <Button asChild>
              <Link href="/coach/templates/create">
                <FilePlus className="w-4 h-4 mr-1" />
                Create Template
              </Link>
            </Button>
          </div>
          <Card className="divide-y divide-slate-800">
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
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base sm:text-lg mb-2">{t.name}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {t.weeks} weeks
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {t.visibility.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button className="shrink-0 w-full sm:w-auto">
                      Use Template
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
