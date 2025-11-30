'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Key,
  Ban,
  CheckCircle,
  Shield,
  UserCheck,
  Users,
  AlertCircle,
  Clock,
  Mail,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Lang } from '@/lib/i18n';

type UserDetail = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'CLIENT' | 'COACH' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  lastLoginAt: string | null;
  lastPasswordChangeAt: string | null;
  client?: { id: string; name: string; email: string | null };
  profile?: any;
  _count?: {
    coachedClients: number;
    programs: number;
    workouts: number;
    workoutSessions: number;
  };
};

export default function UserDetailClient({
  user: initialUser,
  lang,
}: {
  user: UserDetail;
  lang: Lang;
}) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [formData, setFormData] = useState({
    name: initialUser.name || '',
    role: initialUser.role,
    status: initialUser.status,
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      
      setNotification({
        message: lang === 'en' ? 'User updated successfully' : 'Usuario actualizado exitosamente',
        type: 'success',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      setNotification({
        message: error.message || (lang === 'en' ? 'Failed to update user' : 'Error al actualizar usuario'),
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateTemporary: true }),
      });

      if (!response.ok) throw new Error('Failed to reset password');

      const data = await response.json();
      setTemporaryPassword(data.temporaryPassword);
      setShowPasswordModal(true);
    } catch (error: any) {
      setNotification({
        message: error.message || (lang === 'en' ? 'Failed to reset password' : 'Error al restablecer contraseña'),
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm(lang === 'en' ? 'Deactivate this user?' : '¿Desactivar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}/deactivate`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to deactivate user');

      const updatedUser = await response.json();
      setUser(updatedUser);
      setFormData({ ...formData, status: 'INACTIVE' });

      setNotification({
        message: lang === 'en' ? 'User deactivated' : 'Usuario desactivado',
        type: 'success',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      setNotification({
        message: error.message || (lang === 'en' ? 'Failed to deactivate user' : 'Error al desactivar usuario'),
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleReactivate = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/reactivate`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to reactivate user');

      const updatedUser = await response.json();
      setUser(updatedUser);
      setFormData({ ...formData, status: 'ACTIVE' });

      setNotification({
        message: lang === 'en' ? 'User reactivated' : 'Usuario reactivado',
        type: 'success',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      setNotification({
        message: error.message || (lang === 'en' ? 'Failed to reactivate user' : 'Error al reactivar usuario'),
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'COACH':
        return <UserCheck className="w-5 h-5 text-emerald-400" />;
      case 'CLIENT':
        return <Users className="w-5 h-5 text-blue-400" />;
      default:
        return <User className="w-5 h-5 text-slate-400" />;
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

  const hasChanges =
    formData.name !== (user.name || '') ||
    formData.role !== user.role ||
    formData.status !== user.status;

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {lang === 'en' ? 'Back' : 'Volver'}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            {getRoleIcon(user.role)}
            <div>
              <h1 className="text-2xl font-bold">{user.name || user.email || 'Unknown'}</h1>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(user.status)}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving
              ? lang === 'en'
                ? 'Saving...'
                : 'Guardando...'
              : lang === 'en'
              ? 'Save Changes'
              : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>{lang === 'en' ? 'Basic Information' : 'Información Básica'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {lang === 'en' ? 'Name' : 'Nombre'}
            </label>
            <Input
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
              value={user.email || ''}
              disabled
              className="bg-slate-900/60 text-slate-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'en' ? 'Email cannot be changed' : 'El correo no se puede cambiar'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {lang === 'en' ? 'Role' : 'Rol'}
            </label>
            <select
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value as 'CLIENT' | 'COACH' | 'ADMIN';
                if (newRole === 'ADMIN') {
                  if (!confirm(lang === 'en' ? 'This will give this user full admin access. Continue?' : 'Esto dará acceso completo de administrador a este usuario. ¿Continuar?')) {
                    return;
                  }
                }
                setFormData({ ...formData, role: newRole });
              }}
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
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-50"
            >
              <option value="ACTIVE">{lang === 'en' ? 'Active' : 'Activo'}</option>
              <option value="INACTIVE">{lang === 'en' ? 'Inactive' : 'Inactivo'}</option>
              <option value="PENDING">{lang === 'en' ? 'Pending' : 'Pendiente'}</option>
            </select>
            {formData.status === 'INACTIVE' && (
              <p className="text-xs text-yellow-400 mt-1">
                {lang === 'en'
                  ? '⚠️ This user cannot log in while inactive.'
                  : '⚠️ Este usuario no puede iniciar sesión mientras esté inactivo.'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security & Password */}
      <Card>
        <CardHeader>
          <CardTitle>{lang === 'en' ? 'Security & Password' : 'Seguridad y Contraseña'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">
                {lang === 'en' ? 'Last Login' : 'Último Acceso'}
              </p>
              <p className="text-slate-200">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : lang === 'en'
                  ? 'Never'
                  : 'Nunca'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">
                {lang === 'en' ? 'Last Password Change' : 'Último Cambio de Contraseña'}
              </p>
              <p className="text-slate-200">
                {user.lastPasswordChangeAt
                  ? new Date(user.lastPasswordChangeAt).toLocaleString()
                  : lang === 'en'
                  ? 'Never'
                  : 'Nunca'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handlePasswordReset}
              className="flex-1"
            >
              <Key className="w-4 h-4 mr-2" />
              {lang === 'en' ? 'Generate Temporary Password' : 'Generar Contraseña Temporal'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>{lang === 'en' ? 'Account Status' : 'Estado de la Cuenta'}</CardTitle>
        </CardHeader>
        <CardContent>
          {user.status === 'ACTIVE' ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                {lang === 'en'
                  ? 'This user can log in and use the platform.'
                  : 'Este usuario puede iniciar sesión y usar la plataforma.'}
              </p>
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                className="w-full"
              >
                <Ban className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Deactivate Account' : 'Desactivar Cuenta'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-yellow-400">
                {lang === 'en'
                  ? '⚠️ This user cannot log in while inactive.'
                  : '⚠️ Este usuario no puede iniciar sesión mientras esté inactivo.'}
              </p>
              <Button
                variant="default"
                onClick={handleReactivate}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Reactivate Account' : 'Reactivar Cuenta'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {user._count && (
        <Card>
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Statistics' : 'Estadísticas'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {user.role === 'COACH' && (
                <>
                  <div>
                    <p className="text-sm text-slate-400">
                      {lang === 'en' ? 'Clients' : 'Clientes'}
                    </p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {user._count.coachedClients}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">
                      {lang === 'en' ? 'Programs' : 'Programas'}
                    </p>
                    <p className="text-2xl font-bold text-blue-400">
                      {user._count.programs}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">
                      {lang === 'en' ? 'Workouts' : 'Entrenamientos'}
                    </p>
                    <p className="text-2xl font-bold text-purple-400">
                      {user._count.workouts}
                    </p>
                  </div>
                </>
              )}
              {user.role === 'CLIENT' && (
                <div>
                  <p className="text-sm text-slate-400">
                    {lang === 'en' ? 'Sessions' : 'Sesiones'}
                  </p>
                  <p className="text-2xl font-bold text-teal-400">
                    {user._count.workoutSessions}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Modal */}
      {showPasswordModal && temporaryPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>{lang === 'en' ? 'Temporary Password' : 'Contraseña Temporal'}</CardTitle>
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
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setTemporaryPassword(null);
                  }}
                >
                  {lang === 'en' ? 'Done' : 'Listo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

