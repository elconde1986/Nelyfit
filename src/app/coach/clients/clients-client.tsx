'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  ArrowLeft,
  User,
  Flame,
  Star,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Lang } from '@/lib/i18n';
import { assignClientToCoach, createClient } from './actions';
import { X } from 'lucide-react';

type Client = {
  id: string;
  name: string;
  email: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  gamification?: {
    streakDays: number;
    level: number;
  } | null;
  currentProgram?: {
    id: string;
    name: string;
  } | null;
};

export default function ClientsClient({
  assignedClients,
  unassignedClients,
  coachId,
  lang,
}: {
  assignedClients: Client[];
  unassignedClients: Client[];
  coachId: string;
  lang: Lang;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [assigningClientId, setAssigningClientId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleAssignClient = async (clientId: string) => {
    setAssigningClientId(clientId);
    try {
      const result = await assignClientToCoach(clientId, coachId);
      if (result.success) {
        setNotification({
          message: lang === 'en' ? 'Client assigned successfully' : 'Cliente asignado exitosamente',
          type: 'success',
        });
        setTimeout(() => {
          router.refresh();
          setNotification(null);
        }, 1500);
      } else {
        setNotification({
          message: result.error || (lang === 'en' ? 'Failed to assign client' : 'Error al asignar cliente'),
          type: 'error',
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      setNotification({
        message: lang === 'en' ? 'Failed to assign client' : 'Error al asignar cliente',
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setAssigningClientId(null);
    }
  };

  const handleCreateClient = async (formData: FormData) => {
    setCreatingClient(true);
    try {
      const result = await createClient({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || undefined,
      });

      if (result.success && result.temporaryPassword) {
        setTemporaryPassword(result.temporaryPassword);
        setNotification({
          message: lang === 'en' ? 'Client created successfully' : 'Cliente creado exitosamente',
          type: 'success',
        });
      } else {
        setNotification({
          message: result.error || (lang === 'en' ? 'Failed to create client' : 'Error al crear cliente'),
          type: 'error',
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      setNotification({
        message: lang === 'en' ? 'Failed to create client' : 'Error al crear cliente',
        type: 'error',
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setCreatingClient(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setTemporaryPassword(null);
    if (temporaryPassword) {
      router.refresh();
    }
  };

  const filteredUnassigned = unassignedClients.filter((client) => {
    const searchLower = search.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.user?.name?.toLowerCase().includes(searchLower) ||
      client.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/coach/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Back to Dashboard' : 'Volver al Panel'}
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'My Clients' : 'Mis Clientes'}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">
            {lang === 'en'
              ? 'Manage your clients and assign new ones'
              : 'Gestiona tus clientes y asigna nuevos'}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          {lang === 'en' ? 'Add New Client' : 'Agregar Cliente'}
        </Button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg ${
            notification.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
              : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Assigned Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            {lang === 'en' ? 'Assigned Clients' : 'Clientes Asignados'} ({assignedClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedClients.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              {lang === 'en'
                ? 'No clients assigned yet. Assign clients from the list below.'
                : 'Aún no tienes clientes asignados. Asigna clientes de la lista a continuación.'}
            </p>
          ) : (
            <div className="space-y-3">
              {assignedClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{client.name}</p>
                      <p className="text-sm text-slate-400 truncate">
                        {client.email || client.user?.email || 'No email'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {client.gamification && (
                          <>
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <Flame className="w-3 h-3 text-orange-400" />
                              {client.gamification.streakDays} {lang === 'en' ? 'days' : 'días'}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <Star className="w-3 h-3 text-yellow-400" />
                              {lang === 'en' ? 'Level' : 'Nivel'} {client.gamification.level}
                            </Badge>
                          </>
                        )}
                        {client.currentProgram && (
                          <Badge variant="secondary" className="text-xs">
                            {client.currentProgram.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="secondary" size="sm" className="shrink-0 ml-4">
                    <Link href={`/coach/clients/${client.id}`}>
                      {lang === 'en' ? 'View Details' : 'Ver Detalles'}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unassigned Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            {lang === 'en' ? 'Available Clients' : 'Clientes Disponibles'} ({unassignedClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unassignedClients.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              {lang === 'en'
                ? 'No unassigned clients available.'
                : 'No hay clientes disponibles sin asignar.'}
            </p>
          ) : (
            <>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={lang === 'en' ? 'Search clients...' : 'Buscar clientes...'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Client List */}
              <div className="space-y-3">
                {filteredUnassigned.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    {lang === 'en' ? 'No clients found.' : 'No se encontraron clientes.'}
                  </p>
                ) : (
                  filteredUnassigned.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{client.name}</p>
                          <p className="text-sm text-slate-400 truncate">
                            {client.email || client.user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="shrink-0 ml-4"
                        onClick={() => handleAssignClient(client.id)}
                        disabled={assigningClientId === client.id}
                      >
                        {assigningClientId === client.id ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            {lang === 'en' ? 'Assigning...' : 'Asignando...'}
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            {lang === 'en' ? 'Assign to Me' : 'Asignar a Mí'}
                          </>
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Client Modal */}
      {showCreateModal && (
        <CreateClientModal
          lang={lang}
          creatingClient={creatingClient}
          temporaryPassword={temporaryPassword}
          onClose={handleCloseModal}
          onSubmit={handleCreateClient}
        />
      )}
    </div>
  );
}

function CreateClientModal({
  lang,
  creatingClient,
  temporaryPassword,
  onClose,
  onSubmit,
}: {
  lang: Lang;
  creatingClient: boolean;
  temporaryPassword: string | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  if (temporaryPassword) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="max-w-md w-full mx-4 bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{lang === 'en' ? 'Client Created' : 'Cliente Creado'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
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
                ? 'Share this password securely with the client. They will need to change it on first login.'
                : 'Comparte esta contraseña de forma segura con el cliente. Necesitarán cambiarla en el primer inicio de sesión.'}
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
              <Button className="flex-1" onClick={onClose}>
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
            <CardTitle>{lang === 'en' ? 'Add New Client' : 'Agregar Nuevo Cliente'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {lang === 'en' ? 'Name' : 'Nombre'} *
              </label>
              <Input
                name="name"
                required
                placeholder={lang === 'en' ? 'Full name' : 'Nombre completo'}
                className="bg-slate-900 border-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {lang === 'en' ? 'Email' : 'Correo'} *
              </label>
              <Input
                name="email"
                type="email"
                required
                placeholder="client@example.com"
                className="bg-slate-900 border-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {lang === 'en' ? 'Phone' : 'Teléfono'} {lang === 'en' ? '(Optional)' : '(Opcional)'}
              </label>
              <Input
                name="phone"
                type="tel"
                placeholder={lang === 'en' ? '+1 234 567 8900' : '+1 234 567 8900'}
                className="bg-slate-900 border-slate-700"
              />
            </div>

            <p className="text-xs text-slate-400">
              {lang === 'en'
                ? 'A temporary password will be generated and shown after creation.'
                : 'Se generará una contraseña temporal que se mostrará después de la creación.'}
            </p>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                {lang === 'en' ? 'Cancel' : 'Cancelar'}
              </Button>
              <Button type="submit" className="flex-1" disabled={creatingClient}>
                {creatingClient
                  ? lang === 'en'
                    ? 'Creating...'
                    : 'Creando...'
                  : lang === 'en'
                  ? 'Create Client'
                  : 'Crear Cliente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

