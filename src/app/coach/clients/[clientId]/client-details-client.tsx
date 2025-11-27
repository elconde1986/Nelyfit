'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  Flame,
  Trophy,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  BarChart3,
  Award,
  Activity,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageToggle } from '@/components/LanguageToggle';
import { translations, Lang } from '@/lib/i18n';
import Link from 'next/link';

type ClientDetailsClientProps = {
  client: any;
  workoutLogs: any[];
  measurements: any[];
  coachId: string;
  lang: Lang;
};

export default function ClientDetailsClient({
  client,
  workoutLogs,
  measurements,
  coachId,
  lang,
}: ClientDetailsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'program' | 'gamification' | 'activity' | 'communication' | 'health'>('overview');
  const [chatOpen, setChatOpen] = useState(false);
  
  const t = translations.coachClientDetails[lang] || translations.coachClientDetails.en;
  const gamification = client.gamification;
  const streak = gamification?.streakDays || 0;
  const level = gamification?.level || 1;
  const xp = gamification?.xp || 0;
  const xpForNextLevel = level * 100;
  const xpProgress = (xp % xpForNextLevel) / xpForNextLevel * 100;

  // Calculate Sweat Score (0-100)
  const calculateSweatScore = () => {
    const consistency = Math.min((client.logs?.filter((l: any) => l.workoutCompleted).length / 14) * 100, 100);
    const streakHealth = Math.min((streak / 7) * 100, 100);
    const workoutIntensity = Math.min((workoutLogs.length / 20) * 100, 100);
    const habitCompletion = Math.min((client.logs?.reduce((acc: number, l: any) => acc + (l.habitsCompleted?.length || 0), 0) / (14 * 3)) * 100, 100);
    
    return Math.round(
      consistency * 0.4 +
      streakHealth * 0.2 +
      workoutIntensity * 0.2 +
      habitCompletion * 0.2
    );
  };

  const sweatScore = calculateSweatScore();
  const sweatScoreColor = sweatScore >= 70 ? 'text-emerald-400' : sweatScore >= 40 ? 'text-yellow-400' : 'text-red-400';

  // Get 14-day streak timeline
  const getStreakTimeline = () => {
    const timeline = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const log = client.logs?.find((l: any) => {
        const logDate = new Date(l.date);
        return logDate.toDateString() === date.toDateString();
      });
      
      if (log) {
        if (log.workoutCompleted) {
          timeline.push({ date, status: 'workout', log });
        } else if (log.habitsCompleted?.length > 0) {
          timeline.push({ date, status: 'habits', log });
        } else {
          timeline.push({ date, status: 'none', log });
        }
      } else {
        timeline.push({ date, status: 'none', log: null });
      }
    }
    return timeline;
  };

  const timeline = getStreakTimeline();

  // Risk detection
  const risks = [];
  if (streak === 0 && gamification?.bestStreak > 0) {
    risks.push({ type: 'streak_drop', message: t.risks.streakDropped, severity: 'high' });
  }
  if (client.logs?.filter((l: any) => l.workoutCompleted).length < 3) {
    risks.push({ type: 'low_adherence', message: t.risks.lowAdherence, severity: 'medium' });
  }
  if (timeline.filter((t) => t.status === 'none').length > 3) {
    risks.push({ type: 'inactivity', message: t.risks.inactivity, severity: 'medium' });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/coach/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">{t.clientDetails}</span>
            </h1>
          </div>
          <LanguageToggle currentLang={lang} />
        </div>

        {/* Client Header Summary Panel */}
        <Card className="mb-6 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{client.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="success">
                      {t.level} {level}
                    </Badge>
                    {streak >= 7 && (
                      <Badge variant="warning" className="gap-1">
                        <Flame className="w-3 h-3" />
                        {streak} {t.dayStreak}
                      </Badge>
                    )}
                    {client.currentProgram && (
                      <span className="text-sm text-slate-400">
                        {client.currentProgram.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setChatOpen(true)} variant="secondary" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t.messageClient}
                </Button>
                <Button variant="secondary" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  {t.addNote}
                </Button>
                <Button variant="secondary" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  {t.sendNudge}
                </Button>
                <Button variant="secondary" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  {t.adjustProgram}
                </Button>
              </div>
            </div>
            {/* XP Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-300">{t.xpProgress}</span>
                <span className="text-slate-400">{xp} / {xpForNextLevel} XP</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Alerts */}
        {risks.length > 0 && (
          <div className="mb-6 space-y-2">
            {risks.map((risk, idx) => (
              <Card key={idx} className={`border-${risk.severity === 'high' ? 'red' : 'yellow'}-500/30 bg-${risk.severity === 'high' ? 'red' : 'yellow'}-500/10`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 text-${risk.severity === 'high' ? 'red' : 'yellow'}-400`} />
                  <p className="text-sm">{risk.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: t.tabs.overview, icon: BarChart3 },
            { id: 'program', label: t.tabs.program, icon: Target },
            { id: 'gamification', label: t.tabs.gamification, icon: Trophy },
            { id: 'activity', label: t.tabs.activity, icon: Activity },
            { id: 'communication', label: t.tabs.communication, icon: MessageSquare },
            { id: 'health', label: t.tabs.health, icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab
              client={client}
              timeline={timeline}
              xp={xp}
              level={level}
              xpProgress={xpProgress}
              xpForNextLevel={xpForNextLevel}
              sweatScore={sweatScore}
              sweatScoreColor={sweatScoreColor}
              workoutLogs={workoutLogs}
              t={t}
            />
          )}

          {activeTab === 'program' && (
            <ProgramTab
              client={client}
              t={t}
            />
          )}

          {activeTab === 'gamification' && (
            <GamificationTab
              client={client}
              gamification={gamification}
              t={t}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityTab
              client={client}
              workoutLogs={workoutLogs}
              t={t}
            />
          )}

          {activeTab === 'communication' && (
            <CommunicationTab
              client={client}
              coachId={coachId}
              chatOpen={chatOpen}
              setChatOpen={setChatOpen}
              t={t}
            />
          )}

          {activeTab === 'health' && (
            <HealthTab
              measurements={measurements}
              client={client}
              t={t}
            />
          )}
        </div>
      </div>
    </main>
  );
}

// Overview Tab Component
function OverviewTab({ client, timeline, xp, level, xpProgress, xpForNextLevel, sweatScore, sweatScoreColor, workoutLogs, t }: any) {
  return (
    <>
      {/* Streak Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t.streakTimeline}</CardTitle>
          <CardDescription>{t.streakTimelineDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 justify-between">
            {timeline.map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                    item.status === 'workout'
                      ? 'bg-emerald-500 text-slate-950'
                      : item.status === 'habits'
                      ? 'bg-yellow-500 text-slate-950'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                  title={item.date.toLocaleDateString()}
                >
                  {item.status === 'workout' ? '✓' : item.status === 'habits' ? '○' : '—'}
                </div>
                <span className="text-xs text-slate-500">{item.date.getDate()}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              {t.workoutDone}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              {t.habitsOnly}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-slate-800" />
              {t.noActivity}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* XP & Level Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.xpProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">{t.currentLevel}</span>
                  <span className="text-2xl font-bold gradient-text">{level}</span>
                </div>
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {xpForNextLevel - (xp % xpForNextLevel)} {t.xpToNextLevel}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <p className="text-xs text-slate-400">{t.xpSources.workouts}</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {workoutLogs.length * 50}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">{t.xpSources.habits}</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {client.logs?.reduce((acc: number, l: any) => acc + (l.habitsCompleted?.length || 0), 0) * 10}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">{t.xpSources.bonus}</p>
                  <p className="text-lg font-bold text-blue-400">
                    {client.logs?.filter((l: any) => l.workoutCompleted && l.habitsCompleted?.length >= 3).length * 20}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.sweatScore}</CardTitle>
            <CardDescription>{t.sweatScoreDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${sweatScoreColor}`}>
                {sweatScore}
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full transition-all duration-500 ${
                    sweatScore >= 70
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : sweatScore >= 40
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}
                  style={{ width: `${sweatScore}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">{t.metrics.consistency}</p>
                  <p className="font-semibold">{Math.round(sweatScore * 0.4)}%</p>
                </div>
                <div>
                  <p className="text-slate-400">{t.metrics.streakHealth}</p>
                  <p className="font-semibold">{Math.round(sweatScore * 0.2)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Program Tab Component
function ProgramTab({ client, t }: any) {
  const program = client.currentProgram;
  if (!program) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">{t.noProgram}</p>
        </CardContent>
      </Card>
    );
  }

  const completedDays = program.days?.filter((d: any) => {
    const log = client.logs?.find((l: any) => {
      const logDate = new Date(l.date);
      const dayDate = new Date(client.programStartDate || new Date());
      dayDate.setDate(dayDate.getDate() + (d.dayIndex - 1));
      return logDate.toDateString() === dayDate.toDateString() && l.workoutCompleted;
    });
    return !!log;
  }).length || 0;

  const adherence = program.days ? (completedDays / program.days.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.programOverview}</CardTitle>
          <CardDescription>{program.name} • {program.goal}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-400">{t.adherence}</p>
              <p className="text-3xl font-bold gradient-text">{Math.round(adherence)}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{t.workoutsCompleted}</p>
              <p className="text-3xl font-bold text-emerald-400">{completedDays} / {program.days?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{t.programWeeks}</p>
              <p className="text-3xl font-bold text-blue-400">{program.weeks?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Breakdown */}
      {program.weeks && program.weeks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">{t.weekBreakdown}</h3>
          {program.weeks.map((week: any) => (
            <Card key={week.id}>
              <CardHeader>
                <CardTitle>{week.title || `${t.week} ${week.weekNumber}`}</CardTitle>
                <CardDescription>{week.notes}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">{t.workoutsCompleted}</p>
                    <p className="text-lg font-semibold">- / -</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t.habitsCompleted}</p>
                    <p className="text-lg font-semibold">- / -</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t.bestDay}</p>
                    <p className="text-lg font-semibold text-emerald-400">-</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t.worstDay}</p>
                    <p className="text-lg font-semibold text-red-400">-</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Program Map */}
      <Card>
        <CardHeader>
          <CardTitle>{t.programMap}</CardTitle>
          <CardDescription>{t.programMapDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {program.days?.slice(0, 28).map((day: any, idx: number) => {
              const isCompleted = client.logs?.some((l: any) => {
                const logDate = new Date(l.date);
                const dayDate = new Date(client.programStartDate || new Date());
                dayDate.setDate(dayDate.getDate() + (day.dayIndex - 1));
                return logDate.toDateString() === dayDate.toDateString() && l.workoutCompleted;
              });
              const isCurrent = idx === Math.floor((new Date().getTime() - new Date(client.programStartDate || new Date()).getTime()) / (1000 * 60 * 60 * 24));
              const isFuture = idx > Math.floor((new Date().getTime() - new Date(client.programStartDate || new Date()).getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={day.id}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-semibold ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950'
                      : isCurrent
                      ? 'bg-emerald-500/30 border-2 border-emerald-500 text-emerald-400'
                      : isFuture
                      ? 'bg-slate-800 text-slate-500'
                      : 'bg-slate-800/50 text-slate-400'
                  }`}
                  title={day.title}
                >
                  {day.isRestDay ? '😌' : '💪'}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Gamification Tab Component
function GamificationTab({ client, gamification, t }: any) {
  const badges = gamification?.badges || [];
  const allBadges = [
    { id: '7_day_streak', name: t.badges.sevenDayStreak, desc: t.badges.sevenDayStreakDesc, unlocked: badges.includes('7_day_streak') },
    { id: '10_workouts', name: t.badges.tenWorkouts, desc: t.badges.tenWorkoutsDesc, unlocked: badges.includes('10_workouts') },
    { id: '100_habits', name: t.badges.hundredHabits, desc: t.badges.hundredHabitsDesc, unlocked: badges.includes('100_habits') },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.badgeCollection}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allBadges.map((badge) => (
              <Card
                key={badge.id}
                className={`${
                  badge.unlocked
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/60 opacity-50'
                }`}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    {badge.unlocked ? (
                      <Trophy className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <Trophy className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <h3 className="font-bold mb-1">{badge.name}</h3>
                  <p className="text-xs text-slate-400 mb-2">{badge.desc}</p>
                  {badge.unlocked ? (
                    <Badge variant="success">{t.unlocked}</Badge>
                  ) : (
                    <Badge variant="default">{t.locked}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.streakStats}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">{t.currentStreak}</p>
                <p className="text-3xl font-bold text-orange-400">{gamification?.streakDays || 0} {t.days}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">{t.bestStreak}</p>
                <p className="text-3xl font-bold text-emerald-400">{gamification?.bestStreak || 0} {t.days}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.totalStats}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">{t.totalWorkouts}</p>
                <p className="text-3xl font-bold text-blue-400">{gamification?.totalWorkouts || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">{t.totalHabits}</p>
                <p className="text-3xl font-bold text-purple-400">{gamification?.totalHabits || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ client, workoutLogs, t }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.dailyActivity}</CardTitle>
        <CardDescription>{t.dailyActivityDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workoutLogs.length === 0 ? (
            <p className="text-center text-slate-400 py-8">{t.noActivityLogs}</p>
          ) : (
            workoutLogs.map((log: any) => (
              <div
                key={log.id}
                className="p-4 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-semibold">{log.workout?.name || t.workout}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {log.duration && (
                    <Badge variant="default">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.floor(log.duration / 60)} {t.min}
                    </Badge>
                  )}
                </div>
                {log.exerciseLogs && log.exerciseLogs.length > 0 && (
                  <div className="mt-2 pl-8 text-sm text-slate-400">
                    {log.exerciseLogs.map((ex: any, idx: number) => (
                      <span key={idx}>
                        {ex.exerciseName} ({ex.sets}x{ex.reps || ex.durationSeconds}s)
                        {idx < log.exerciseLogs.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Communication Tab Component
function CommunicationTab({ client, coachId, chatOpen, setChatOpen, t }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.chatHistory}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {client.messages && client.messages.length > 0 ? (
                client.messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'COACH' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl px-4 py-2 ${
                        msg.sender === 'COACH'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-50'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-8">{t.noMessages}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>{t.coachNotes}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {client.notes && client.notes.length > 0 ? (
                client.notes.map((note: any) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <p className="text-sm mb-1">{note.message}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                    {note.autoSuggested && (
                      <Badge variant="default" className="mt-1 text-xs">
                        {t.autoSuggested}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-4 text-sm">{t.noNotes}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Health Tab Component
function HealthTab({ measurements, client, t }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.healthMetrics}</CardTitle>
        <CardDescription>{t.healthMetricsDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        {measurements.length === 0 ? (
          <p className="text-center text-slate-400 py-8">{t.noMeasurements}</p>
        ) : (
          <div className="space-y-4">
            {measurements.slice(0, 10).map((m: any) => (
              <div
                key={m.id}
                className="p-4 rounded-lg bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{new Date(m.date).toLocaleDateString()}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {m.weight && (
                    <div>
                      <p className="text-slate-400">{t.weight}</p>
                      <p className="font-semibold">{m.weight} kg</p>
                    </div>
                  )}
                  {m.bodyFat && (
                    <div>
                      <p className="text-slate-400">{t.bodyFat}</p>
                      <p className="font-semibold">{m.bodyFat}%</p>
                    </div>
                  )}
                  {m.chest && (
                    <div>
                      <p className="text-slate-400">{t.chest}</p>
                      <p className="font-semibold">{m.chest} cm</p>
                    </div>
                  )}
                  {m.waist && (
                    <div>
                      <p className="text-slate-400">{t.waist}</p>
                      <p className="font-semibold">{m.waist} cm</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

