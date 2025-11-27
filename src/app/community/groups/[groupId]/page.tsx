import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { Users, Trophy, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GroupDetailPage({
  params,
}: {
  params: { groupId: string };
}) {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  const group = await prisma.group.findUnique({
    where: { id: params.groupId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      challenges: {
        where: {
          endDate: { gte: new Date() },
        },
        include: {
          _count: {
            select: { participants: true },
          },
          participants: {
            where: { userId: user.id },
          },
        },
        orderBy: { startDate: 'asc' },
      },
    },
  });

  if (!group) {
    redirect('/community/groups');
  }

  const isMember = group.members.some(m => m.userId === user.id);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <header className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/community/groups">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Back to Groups' : 'Volver a Grupos'}
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">{group.name}</span>
          </h1>
          {group.description && (
            <p className="text-slate-400 mt-2">{group.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4">
            <Badge variant={group.isPublic ? 'default' : 'outline'}>
              {group.isPublic ? (lang === 'en' ? 'Public' : 'Público') : (lang === 'en' ? 'Private' : 'Privado')}
            </Badge>
            <span className="text-sm text-slate-400 flex items-center gap-1">
              <Users className="w-4 h-4" />
              {group.members.length} {lang === 'en' ? 'members' : 'miembros'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                {lang === 'en' ? 'Members' : 'Miembros'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.members.slice(0, 10).map((member) => (
                  <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold">{member.user.name || member.user.email}</span>
                  </div>
                ))}
                {group.members.length > 10 && (
                  <p className="text-xs text-slate-400 text-center pt-2">
                    +{group.members.length - 10} {lang === 'en' ? 'more members' : 'más miembros'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                {lang === 'en' ? 'Active Challenges' : 'Desafíos Activos'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {group.challenges.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  {lang === 'en' ? 'No active challenges' : 'No hay desafíos activos'}
                </p>
              ) : (
                <div className="space-y-3">
                  {group.challenges.map((challenge) => (
                    <div key={challenge.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{challenge.name}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {challenge._count.participants} {lang === 'en' ? 'participants' : 'participantes'}
                          </p>
                        </div>
                        {challenge.participants.length > 0 && (
                          <Badge variant="success" className="text-xs">
                            {lang === 'en' ? 'Joined' : 'Unido'}
                          </Badge>
                        )}
                      </div>
                      {challenge.endDate && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {lang === 'en' ? 'Ends' : 'Termina'}: {new Date(challenge.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

