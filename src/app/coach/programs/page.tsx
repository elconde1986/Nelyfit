import { prisma } from '@/lib/prisma';
import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FilePlus, Calendar, Eye, Edit, Copy, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageToggle } from '@/components/LanguageToggle';
import { translations, Lang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function ProgramsPage() {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();
  const t = translations.coach[lang] || translations.coach.en;

  const programs = await prisma.program.findMany({
    where: {
      coachId: user.id,
    },
    include: {
      _count: {
        select: {
          clients: true,
          days: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">
                {lang === 'en' ? 'Program Planner' : 'Planificador de Programas'}
              </span>
            </h1>
            <p className="text-slate-400 mt-1">
              {lang === 'en'
                ? 'Create and manage multi-week training programs'
                : 'Crea y gestiona programas de entrenamiento de varias semanas'}
            </p>
          </div>
          <Button asChild>
            <Link href="/coach/programs/create">
              <FilePlus className="w-4 h-4 mr-2" />
              {lang === 'en' ? 'New Program' : 'Nuevo Programa'}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => {
            const isArchived = program.status === 'ARCHIVED';
            return (
              <Card key={program.id} className={isArchived ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {program.name}
                        {isArchived && (
                          <Badge variant="warning" className="text-xs">
                            {lang === 'en' ? 'Archived' : 'Archivado'}
                          </Badge>
                        )}
                      </CardTitle>
                      {program.description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                          {program.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        {lang === 'en' ? 'Weeks' : 'Semanas'}
                      </span>
                      <span className="font-semibold">{program.totalWeeks}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        {lang === 'en' ? 'Days/Week' : 'Días/Semana'}
                      </span>
                      <span className="font-semibold">{program.targetDaysPerWeek}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        {lang === 'en' ? 'Clients' : 'Clientes'}
                      </span>
                      <span className="font-semibold">{program._count.clients}</span>
                    </div>
                    {program.goalTags && program.goalTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {program.goalTags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <Button asChild variant="ghost" size="sm" className="flex-1">
                        <Link href={`/coach/programs/${program.id}`}>
                          <Eye className="w-3 h-3 mr-1" />
                          {lang === 'en' ? 'View' : 'Ver'}
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="flex-1">
                        <Link href={`/coach/programs/${program.id}/planner`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          {lang === 'en' ? 'Plan' : 'Planificar'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {programs.length === 0 && (
          <Card className="mt-8">
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {lang === 'en' ? 'No programs yet' : 'Aún no hay programas'}
              </h3>
              <p className="text-slate-400 mb-4">
                {lang === 'en'
                  ? 'Create your first training program to get started'
                  : 'Crea tu primer programa de entrenamiento para comenzar'}
              </p>
              <Button asChild>
                <Link href="/coach/programs/create">
                  <FilePlus className="w-4 h-4 mr-2" />
                  {lang === 'en' ? 'Create Program' : 'Crear Programa'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

