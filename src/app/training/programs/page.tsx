import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Dumbbell, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TrainingProgramsPage() {
  const user = await requireAuth('CLIENT');
  if (!user || !user.clientId) redirect('/login/client');

  const lang = getLang();

  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    include: {
      programAssignments: {
        include: {
          program: {
            include: {
              _count: {
                select: { days: true },
              },
            },
          },
        },
        orderBy: { startDate: 'desc' },
      },
    },
  });

  if (!client) {
    redirect('/login/client');
  }

  const currentAssignment = client.programAssignments.find(a => a.status === 'ACTIVE');
  const pastAssignments = client.programAssignments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Training Programs' : 'Programas de Entrenamiento'}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'en'
              ? 'View your current and past training programs'
              : 'Ver tus programas de entrenamiento actuales y pasados'}
          </p>
        </header>

        {currentAssignment && (
          <Card className="mb-6 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-emerald-400" />
                  {lang === 'en' ? 'Current Program' : 'Programa Actual'}
                </CardTitle>
                <Badge variant="success">{lang === 'en' ? 'Active' : 'Activo'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <p className="font-semibold text-lg mb-2">{currentAssignment.program.name}</p>
                {currentAssignment.program.description && (
                  <p className="text-sm text-slate-400 mb-4">{currentAssignment.program.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {lang === 'en' ? 'Started' : 'Iniciado'}: {new Date(currentAssignment.startDate).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{currentAssignment.program.totalWeeks} {lang === 'en' ? 'weeks' : 'semanas'}</span>
                  <span>•</span>
                  <span>{currentAssignment.program._count.days} {lang === 'en' ? 'days' : 'días'}</span>
                </div>
                {currentAssignment.program.goalTags && currentAssignment.program.goalTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {currentAssignment.program.goalTags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {pastAssignments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'en' ? 'Past Programs' : 'Programas Anteriores'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pastAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {assignment.status === 'COMPLETED' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Dumbbell className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <p className="font-semibold">{assignment.program.name}</p>
                        <p className="text-sm text-slate-400">
                          {new Date(assignment.startDate).toLocaleDateString()}
                          {assignment.status === 'COMPLETED' && ' • ' + (lang === 'en' ? 'Completed' : 'Completado')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={assignment.status === 'COMPLETED' ? 'success' : 'default'}>
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!currentAssignment && pastAssignments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {lang === 'en'
                  ? 'No programs assigned yet. Your coach will assign a program soon!'
                  : 'Aún no se han asignado programas. ¡Tu entrenador asignará un programa pronto!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
