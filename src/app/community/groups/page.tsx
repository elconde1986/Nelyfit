import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Users, Plus, Trophy, Calendar } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  // Get groups user is a member of
  const groupMemberships = await prisma.groupMember.findMany({
    where: { userId: user.id },
    include: {
      group: {
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
              participants: {
                where: { userId: user.id },
              },
              _count: {
                select: { participants: true },
              },
            },
            orderBy: { startDate: 'desc' },
            take: 3,
          },
          _count: {
            select: { members: true, challenges: true },
          },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  const groups = groupMemberships.map(gm => gm.group);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">
                {lang === 'en' ? 'Community Groups' : 'Grupos de la Comunidad'}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {lang === 'en'
                ? 'Join groups, compete in challenges, and track progress together'
                : 'Únete a grupos, compite en desafíos y rastrea el progreso juntos'}
            </p>
          </div>
          {user.role === 'COACH' && (
            <Button asChild>
              <Link href="/community/groups/create">
                <Plus className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Create Group' : 'Crear Grupo'}
              </Link>
            </Button>
          )}
        </header>

        {groups.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">
                {lang === 'en'
                  ? "You're not part of any groups yet"
                  : 'Aún no eres parte de ningún grupo'}
              </p>
              {user.role === 'COACH' && (
                <Button asChild>
                  <Link href="/community/groups/create">
                    <Plus className="w-4 h-4 mr-2" />
                    {lang === 'en' ? 'Create Your First Group' : 'Crea Tu Primer Grupo'}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="hover:border-emerald-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                        {group.name}
                      </CardTitle>
                      {group.description && (
                        <p className="text-sm text-slate-400 mt-1">{group.description}</p>
                      )}
                    </div>
                    {group.isPublic && (
                      <Badge variant="outline" className="text-xs">
                        {lang === 'en' ? 'Public' : 'Público'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {group._count.members} {lang === 'en' ? 'members' : 'miembros'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {group._count.challenges} {lang === 'en' ? 'challenges' : 'desafíos'}
                    </span>
                  </div>

                  {group.challenges.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase">
                        {lang === 'en' ? 'Active Challenges' : 'Desafíos Activos'}
                      </p>
                      {group.challenges.map((challenge) => (
                        <div
                          key={challenge.id}
                          className="p-2 rounded-lg bg-slate-900/60 border border-slate-800"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{challenge.name}</p>
                              <p className="text-xs text-slate-400">
                                {challenge._count.participants} {lang === 'en' ? 'participants' : 'participantes'}
                              </p>
                            </div>
                            {challenge.participants.length > 0 && (
                              <Badge variant="success" className="text-xs">
                                {lang === 'en' ? 'Joined' : 'Unido'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/community/groups/${group.id}`}>
                      {lang === 'en' ? 'View Group' : 'Ver Grupo'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
