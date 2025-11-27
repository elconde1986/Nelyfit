import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { Users, Shield, UserCheck, UserX } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  const users = await prisma.user.findMany({
    include: {
      client: {
        select: { id: true },
      },
      _count: {
        select: {
          coachedClients: true,
          programs: true,
          workouts: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const stats = {
    total: users.length,
    coaches: users.filter(u => u.role === 'COACH').length,
    clients: users.filter(u => u.role === 'CLIENT').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'COACH':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'CLIENT':
        return <Users className="w-4 h-4 text-blue-400" />;
      default:
        return <UserX className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      ADMIN: 'default',
      COACH: 'success',
      CLIENT: 'outline',
    };
    return variants[role] || 'default';
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
              {lang === 'en' ? 'User Management' : 'Gestión de Usuarios'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'View and manage all platform users'
              : 'Ver y gestiona todos los usuarios de la plataforma'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Users' : 'Usuarios Totales'}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Coaches' : 'Entrenadores'}</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.coaches}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Clients' : 'Clientes'}</p>
              <p className="text-2xl font-bold text-blue-400">{stats.clients}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Admins' : 'Administradores'}</p>
              <p className="text-2xl font-bold text-purple-400">{stats.admins}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'All Users' : 'Todos los Usuarios'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getRoleIcon(u.role)}
                    <div>
                      <p className="font-semibold">{u.name || u.email || 'Unknown'}</p>
                      <p className="text-sm text-slate-400">{u.email}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{lang === 'en' ? 'Joined' : 'Se unió'}: {new Date(u.createdAt).toLocaleDateString()}</span>
                        {u.role === 'COACH' && (
                          <>
                            <span>•</span>
                            <span>{u._count.coachedClients} {lang === 'en' ? 'clients' : 'clientes'}</span>
                            <span>•</span>
                            <span>{u._count.programs} {lang === 'en' ? 'programs' : 'programas'}</span>
                          </>
                        )}
                        {u.role === 'CLIENT' && u.client && (
                          <>
                            <span>•</span>
                            <span>{lang === 'en' ? 'Client account' : 'Cuenta de cliente'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getRoleBadge(u.role)}>{u.role}</Badge>
                </div>
              ))}
            </div>
            {users.length === 0 && (
              <p className="text-center text-slate-400 py-8">
                {lang === 'en' ? 'No users found' : 'No se encontraron usuarios'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

