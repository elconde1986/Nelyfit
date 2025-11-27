'use client';

import { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Target, TrendingUp, Award, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lang } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

type Challenge = {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  goal?: string | null;
  group?: { id: string; name: string; isPublic: boolean } | null;
  userParticipation?: {
    id: string;
    progress: number;
    rank: number | null;
  } | null;
  userRank?: number | null;
  participants: Array<{
    id: string;
    userId: string;
    progress: number;
    rank: number | null;
    user: { id: string; name: string | null; email: string | null };
  }>;
  _count: { participants: number };
};

export function ChallengeDetailClient({
  challenge,
  leaderboard,
  userId,
  lang,
}: {
  challenge: Challenge;
  leaderboard: any[];
  userId: string;
  lang: Lang;
}) {
  const router = useRouter();
  const [isJoined, setIsJoined] = useState(!!challenge.userParticipation);
  const [loading, setLoading] = useState(false);
  const [showGroupOnly, setShowGroupOnly] = useState(false);

  const handleJoin = async () => {
    if (isJoined) return;

    setLoading(true);
    try {
      const res = await fetch('/api/community/challenges/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id }),
      });

      if (res.ok) {
        setIsJoined(true);
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || (lang === 'en' ? 'Failed to join' : 'Error al unirse'));
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      alert(lang === 'en' ? 'An error occurred' : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const isEnded = now > endDate;

  const statusBadge = isEnded
    ? { label: lang === 'en' ? 'Ended' : 'Finalizado', variant: 'secondary' as const }
    : isUpcoming
    ? { label: lang === 'en' ? 'Upcoming' : 'Próximamente', variant: 'secondary' as const }
    : { label: lang === 'en' ? 'Active' : 'Activo', variant: 'success' as const };

  const progress = challenge.userParticipation?.progress || 0;
  const maxPoints = 100; // Default max points
  const progressPercent = Math.min((progress / maxPoints) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            <span className="gradient-text">{challenge.name}</span>
          </h1>
          {challenge.description && (
            <p className="text-slate-400">{challenge.description}</p>
          )}
        </div>
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
      </div>

      {/* Challenge Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">
                  {lang === 'en' ? 'Start Date' : 'Fecha Inicio'}
                </p>
                <p className="text-sm font-semibold">
                  {startDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">
                  {lang === 'en' ? 'End Date' : 'Fecha Fin'}
                </p>
                <p className="text-sm font-semibold">
                  {endDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">
                  {lang === 'en' ? 'Participants' : 'Participantes'}
                </p>
                <p className="text-sm font-semibold">{challenge._count.participants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules Panel */}
      {challenge.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              {lang === 'en' ? 'Challenge Details' : 'Detalles del Desafío'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-300">
              <p>{challenge.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Progress */}
      {isJoined && challenge.userParticipation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              {lang === 'en' ? 'Your Progress' : 'Tu Progreso'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">
                  {lang === 'en' ? 'Points' : 'Puntos'}
                </span>
                <span className="text-lg font-bold">
                  {progress} / {maxPoints}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            {challenge.userRank && (
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">
                  {lang === 'en' ? 'Rank' : 'Posición'}: #{challenge.userRank}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Join Button */}
      {!isJoined && isActive && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-slate-400 mb-4">
              {lang === 'en'
                ? 'Join this challenge to start earning points!'
                : '¡Únete a este desafío para comenzar a ganar puntos!'}
            </p>
            <Button onClick={handleJoin} disabled={loading} size="lg">
              {loading
                ? lang === 'en'
                  ? 'Joining...'
                  : 'Uniéndose...'
                : lang === 'en'
                ? 'Join Challenge'
                : 'Unirse al Desafío'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                {lang === 'en' ? 'Leaderboard' : 'Clasificación'}
              </CardTitle>
              {challenge.group && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowGroupOnly(!showGroupOnly)}
                >
                  {showGroupOnly
                    ? lang === 'en'
                      ? 'Show All'
                      : 'Mostrar Todos'
                    : lang === 'en'
                    ? 'Group Only'
                    : 'Solo Grupo'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard
                .filter(p => !showGroupOnly || challenge.group?.id)
                .map((participant, idx) => {
                  const isCurrentUser = participant.userId === userId;
                  return (
                    <div
                      key={participant.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isCurrentUser
                          ? 'bg-emerald-500/10 border border-emerald-500/50'
                          : 'bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {participant.user.name || participant.user.email}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-emerald-400">
                                ({lang === 'en' ? 'You' : 'Tú'})
                              </span>
                            )}
                          </p>
                          {challenge.group && (
                            <p className="text-xs text-slate-400">{challenge.group.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{participant.progress}</p>
                        <p className="text-xs text-slate-400">
                          {lang === 'en' ? 'points' : 'puntos'}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

