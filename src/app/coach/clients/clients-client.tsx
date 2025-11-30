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
import { assignClientToCoach } from './actions';

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
    </div>
  );
}

