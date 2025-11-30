'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Shield,
  UserCheck,
  Users,
  UserX,
  Key,
  Ban,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Lang } from '@/lib/i18n';

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'CLIENT' | 'COACH' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  lastLoginAt: string | null;
  lastPasswordChangeAt: string | null;
  client?: { id: string };
  _count?: {
    coachedClients: number;
    programs: number;
    workouts: number;
  };
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export default function UsersClient({ initialLang }: { initialLang: Lang }) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(initialLang);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('pageSize', '20');

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading users:', error);
      setNotification({
        message: lang === 'en' ? 'Failed to load users' : 'Error al cargar usuarios',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadUsers();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleDeactivate = async (userId: string) => {
    if (!confirm(lang === 'en' ? 'Deactivate this user?' : '¿Desactivar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to deactivate user');

      setNotification({
        message: lang === 'en' ? 'User deactivated' : 'Usuario desactivado',
        type: 'success',
      });
      setTimeout(() => setNotification(null), 3000);
      loadUsers();
    } catch (error) {
      setNotification({
        message: lang === 'en' ? 'Failed to deactivate user' : 'Error al desactivar usuario',
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reactivate`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to reactivate user');

      setNotification({
        message: lang === 'en' ? 'User reactivated' : 'Usuario reactivado',
        type: 'success',
      });
      setTimeout(() => setNotification(null), 3000);
      loadUsers();
    } catch (error) {
      setNotification({
        message: lang === 'en' ? 'Failed to reactivate user' : 'Error al reactivar usuario',
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handlePasswordReset = async (userId: string) => {
    if (!confirm(lang === 'en' ? 'Generate temporary password for this user?' : '¿Generar contraseña temporal para este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateTemporary: true }),
      });

      if (!response.ok) throw new Error('Failed to reset password');

      const data = await response.json();
      
      if (data.temporaryPassword) {
        alert(
          lang === 'en'
            ? `Temporary password: ${data.temporaryPassword}\n\nCopy this password and share it securely with the user.`
            : `Contraseña temporal: ${data.temporaryPassword}\n\nCopia esta contraseña y compártela de forma segura con el usuario.`
        );
      }

      setNotification({
        message: lang === 'en' ? 'Password reset successful' : 'Contraseña restablecida exitosamente',
        type: 'success',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        message: lang === 'en' ? 'Failed to reset password' : 'Error al restablecer contraseña',
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3000);
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            {lang === 'en' ? 'Active' : 'Activo'}
          </Badge>
        );
      case 'INACTIVE':
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/50">
            <Ban className="w-3 h-3 mr-1" />
            {lang === 'en' ? 'Inactive' : 'Inactivo'}
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            <Clock className="w-3 h-3 mr-1" />
            {lang === 'en' ? 'Pending' : 'Pendiente'}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-4 py-3 rounded-lg shadow-xl max-w-md w-[90%] ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center justify-center">
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {lang === 'en' ? 'All Users' : 'Todos los Usuarios'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {pagination && `${pagination.total} ${lang === 'en' ? 'total users' : 'usuarios totales'}`}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {lang === 'en' ? 'New User' : 'Nuevo Usuario'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder={lang === 'en' ? 'Search by name or email...' : 'Buscar por nombre o email...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-50"
            >
              <option value="all">{lang === 'en' ? 'All Roles' : 'Todos los Roles'}</option>
              <option value="CLIENT">{lang === 'en' ? 'Clients' : 'Clientes'}</option>
              <option value="COACH">{lang === 'en' ? 'Coaches' : 'Entrenadores'}</option>
              <option value="ADMIN">{lang === 'en' ? 'Admins' : 'Administradores'}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-50"
            >
              <option value="all">{lang === 'en' ? 'All Status' : 'Todos los Estados'}</option>
              <option value="ACTIVE">{lang === 'en' ? 'Active' : 'Activo'}</option>
              <option value="INACTIVE">{lang === 'en' ? 'Inactive' : 'Inactivo'}</option>
              <option value="PENDING">{lang === 'en' ? 'Pending' : 'Pendiente'}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
              <p className="text-slate-400">{lang === 'en' ? 'Loading users...' : 'Cargando usuarios...'}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <UserX className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">{lang === 'en' ? 'No users found' : 'No se encontraron usuarios'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/60 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                      {lang === 'en' ? 'User' : 'Usuario'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                      {lang === 'en' ? 'Role' : 'Rol'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">
                      {lang === 'en' ? 'Status' : 'Estado'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                      {lang === 'en' ? 'Created' : 'Creado'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                      {lang === 'en' ? 'Last Login' : 'Último Acceso'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">
                      {lang === 'en' ? 'Actions' : 'Acciones'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {getRoleIcon(u.role)}
                          <div>
                            <p className="font-semibold text-slate-50">
                              {u.name || u.email || 'Unknown'}
                            </p>
                            <p className="text-sm text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.role === 'ADMIN' ? 'default' : u.role === 'COACH' ? 'success' : 'outline'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(u.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString()
                          : lang === 'en' ? 'Never' : 'Nunca'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/users/${u.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePasswordReset(u.id)}
                            title={lang === 'en' ? 'Reset Password' : 'Restablecer Contraseña'}
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          {u.status === 'ACTIVE' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivate(u.id)}
                              title={lang === 'en' ? 'Deactivate' : 'Desactivar'}
                            >
                              <Ban className="w-4 h-4 text-red-400" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReactivate(u.id)}
                              title={lang === 'en' ? 'Reactivate' : 'Reactivar'}
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {lang === 'en'
              ? `Page ${pagination.page} of ${pagination.totalPages}`
              : `Página ${pagination.page} de ${pagination.totalPages}`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {lang === 'en' ? 'Previous' : 'Anterior'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              {lang === 'en' ? 'Next' : 'Siguiente'}
            </Button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          lang={lang}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadUsers();
            setNotification({
              message: lang === 'en' ? 'User created successfully' : 'Usuario creado exitosamente',
              type: 'success',
            });
            setTimeout(() => setNotification(null), 3000);
          }}
        />
      )}
    </div>
  );
}

function CreateUserModal({
  lang,
  onClose,
  onSuccess,
}: {
  lang: Lang;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CLIENT' as 'CLIENT' | 'COACH' | 'ADMIN',
    status: 'PENDING' as 'ACTIVE' | 'INACTIVE' | 'PENDING',
    sendWelcomeEmail: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      const data = await response.json();
      
      if (data.temporaryPassword) {
        setTemporaryPassword(data.temporaryPassword);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (temporaryPassword) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="max-w-md w-full mx-4 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'User Created' : 'Usuario Creado'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
              <p className="text-sm text-emerald-400 mb-2">
                {lang === 'en' ? 'Temporary Password:' : 'Contraseña Temporal:'}
              </p>
              <p className="font-mono text-lg font-bold text-emerald-300 break-all">
                {temporaryPassword}
              </p>
            </div>
            <p className="text-sm text-slate-400">
              {lang === 'en'
                ? 'Copy this password and share it securely with the user. They will need to change it on first login.'
                : 'Copia esta contraseña y compártela de forma segura con el usuario. Necesitarán cambiarla en el primer inicio de sesión.'}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(temporaryPassword);
                  alert(lang === 'en' ? 'Password copied!' : '¡Contraseña copiada!');
                }}
              >
                {lang === 'en' ? 'Copy Password' : 'Copiar Contraseña'}
              </Button>
              <Button className="flex-1" onClick={onSuccess}>
                {lang === 'en' ? 'Done' : 'Listo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4 bg-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{lang === 'en' ? 'Create New User' : 'Crear Nuevo Usuario'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {lang === 'en' ? 'Name' : 'Nombre'}
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={lang === 'en' ? 'Full name' : 'Nombre completo'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {lang === 'en' ? 'Email' : 'Correo'}
              </label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {lang === 'en' ? 'Role' : 'Rol'}
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-50"
              >
                <option value="CLIENT">{lang === 'en' ? 'Client' : 'Cliente'}</option>
                <option value="COACH">{lang === 'en' ? 'Coach' : 'Entrenador'}</option>
                <option value="ADMIN">{lang === 'en' ? 'Admin' : 'Administrador'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {lang === 'en' ? 'Status' : 'Estado'}
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-50"
              >
                <option value="PENDING">{lang === 'en' ? 'Pending' : 'Pendiente'}</option>
                <option value="ACTIVE">{lang === 'en' ? 'Active' : 'Activo'}</option>
                <option value="INACTIVE">{lang === 'en' ? 'Inactive' : 'Inactivo'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendWelcomeEmail"
                checked={formData.sendWelcomeEmail}
                onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500"
              />
              <label htmlFor="sendWelcomeEmail" className="text-sm text-slate-300">
                {lang === 'en'
                  ? 'Send welcome email (otherwise generate temporary password)'
                  : 'Enviar correo de bienvenida (de lo contrario, generar contraseña temporal)'}
              </label>
            </div>

            {formData.role === 'ADMIN' && (
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm">
                {lang === 'en'
                  ? '⚠️ This will give this user full admin access. Continue?'
                  : '⚠️ Esto dará acceso completo de administrador a este usuario. ¿Continuar?'}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                {lang === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading
                  ? lang === 'en'
                    ? 'Creating...'
                    : 'Creando...'
                  : lang === 'en'
                  ? 'Create User'
                  : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

