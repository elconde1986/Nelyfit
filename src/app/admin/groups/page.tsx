import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Users, Lock, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminGroupsPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const groups = await prisma.group.findMany({
    include: {
      _count: {
        select: { members: true, challenges: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const stats = {
    total: groups.length,
    public: groups.filter(g => g.isPublic).length,
    private: groups.filter(g => !g.isPublic).length,
    totalMembers: groups.reduce((sum, g) => sum + g._count.members, 0),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Group Management' : 'Gestión de Grupos'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'Monitor and manage all community groups'
              : 'Monitorea y gestiona todos los grupos de la comunidad'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Groups' : 'Grupos Totales'}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Public' : 'Públicos'}</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.public}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Private' : 'Privados'}</p>
              <p className="text-2xl font-bold text-blue-400">{stats.private}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Members' : 'Miembros Totales'}</p>
              <p className="text-2xl font-bold text-purple-400">{stats.totalMembers}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'All Groups' : 'Todos los Grupos'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {group.isPublic ? (
                      <Globe className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-blue-400" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{group.name}</p>
                      {group.description && (
                        <p className="text-sm text-slate-400 line-clamp-1">{group.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {group._count.members} {lang === 'en' ? 'members' : 'miembros'}
                        </span>
                        <span>{group._count.challenges} {lang === 'en' ? 'challenges' : 'desafíos'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={group.isPublic ? 'success' : 'outline'}>
                    {group.isPublic ? (lang === 'en' ? 'Public' : 'Público') : (lang === 'en' ? 'Private' : 'Privado')}
                  </Badge>
                </div>
              ))}
            </div>
            {groups.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No groups found' : 'No se encontraron grupos'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

