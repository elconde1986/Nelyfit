import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import UsersClient from './users-client';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await requireAuth('ADMIN');
  if (!user) redirect('/');

  const lang = getLang();

  // Get stats for header
  const [total, coaches, clients, admins, active, inactive, pending] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'COACH' } }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'INACTIVE' } }),
    prisma.user.count({ where: { status: 'PENDING' } }),
  ]);

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Total Users' : 'Usuarios Totales'}</p>
              <p className="text-2xl font-bold">{total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Coaches' : 'Entrenadores'}</p>
              <p className="text-2xl font-bold text-emerald-400">{coaches}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Clients' : 'Clientes'}</p>
              <p className="text-2xl font-bold text-blue-400">{clients}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Admins' : 'Administradores'}</p>
              <p className="text-2xl font-bold text-purple-400">{admins}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Active' : 'Activos'}</p>
              <p className="text-2xl font-bold text-emerald-400">{active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Inactive' : 'Inactivos'}</p>
              <p className="text-2xl font-bold text-red-400">{inactive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{lang === 'en' ? 'Pending' : 'Pendientes'}</p>
              <p className="text-2xl font-bold text-yellow-400">{pending}</p>
            </CardContent>
          </Card>
        </div>

        <UsersClient initialLang={lang} />
      </div>
    </main>
  );
}

