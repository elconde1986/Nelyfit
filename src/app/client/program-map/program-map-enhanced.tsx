'use client';

import Link from 'next/link';
import { MapPin, ArrowLeft, Dumbbell, Coffee, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageToggle } from '@/components/LanguageToggle';
import { translations, Lang } from '@/lib/i18n';

type Node = {
  id: string;
  dayIndex: number;
  title: string;
  isRest: boolean;
  status: 'completed' | 'current' | 'locked' | 'rest';
};

export default function ProgramMapEnhanced({
  program,
  nodes,
  lang,
}: {
  program: any;
  nodes: Node[];
  lang: Lang;
}) {
  const t = translations.client[lang] || translations.client.en;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="flex items-start justify-between gap-4 animate-fade-in">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                {t.programMap}
              </p>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              {program.name}
            </h1>
            {program.goal && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{program.goal}</p>
            )}
          </div>
          <Button asChild variant="secondary" size="sm" className="shrink-0">
            <Link href="/client/today">
              <ArrowLeft className="w-3 h-3 mr-1" />
              {t.back}
            </Link>
          </Button>
        </header>

        <p className="text-sm sm:text-base text-slate-400 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {lang === 'en'
            ? 'Each circle is a program day. Today is highlighted.'
            : 'Cada círculo es un día del programa. Hoy está resaltado.'}
        </p>

        <Card className="relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="pt-6">
            {/* Duolingo-style tree layout - grouped by weeks */}
            <div className="space-y-8">
              {Array.from({ length: Math.ceil(nodes.length / 7) }, (_, weekIdx) => {
                const weekNodes = nodes.slice(weekIdx * 7, (weekIdx + 1) * 7);
                return (
                  <div key={weekIdx} className="space-y-4">
                    <div className="text-sm font-semibold text-slate-400 text-center">
                      {lang === 'en' ? 'Week' : 'Semana'} {weekIdx + 1}
                    </div>
                    <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                      {weekNodes.map((n, dayIdx) => {
                        const isCurrent = n.status === 'current';
                        const isCompleted = n.status === 'completed';
                        const isRest = n.status === 'rest';
                        const isLocked = n.status === 'locked';
                        const label = isRest ? t.rest : `${t.day} ${n.dayIndex}`;

                        let bg = 'bg-slate-800/60 border-slate-700';
                        let shadow = '';
                        let scale = '';
                        if (isCurrent) {
                          bg = 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-400';
                          shadow = 'shadow-lg shadow-emerald-500/30';
                          scale = 'scale-110';
                        } else if (isCompleted) {
                          bg = 'bg-gradient-to-br from-emerald-500/30 to-emerald-500/20 border-emerald-400/60';
                          shadow = 'shadow-md shadow-emerald-500/10';
                        } else if (isRest) {
                          bg = 'bg-slate-800/50 border-sky-400/40';
                        } else if (isLocked) {
                          bg = 'bg-slate-900/40 border-slate-800 opacity-50';
                        }

                        return (
                          <div
                            key={n.id}
                            className={`flex flex-col items-center justify-center gap-2 transition-all duration-200 relative ${isCurrent ? 'z-10' : ''}`}
                          >
                            {/* Connection line (except first day of week) */}
                            {dayIdx > 0 && (
                              <div className="absolute left-0 top-1/2 w-3 sm:w-4 h-0.5 bg-slate-700 -translate-x-full" />
                            )}
                            <div
                              className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${bg} ${shadow} ${scale} relative`}
                            >
                              {isRest ? (
                                <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-sky-400" />
                              ) : isCompleted ? (
                                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                              ) : isLocked ? (
                                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                              ) : (
                                <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                              )}
                              {isCurrent && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
                              )}
                            </div>
                            <p className={`text-xs sm:text-sm font-semibold ${isLocked ? 'text-slate-600' : 'text-slate-200'}`}>
                              {label}
                            </p>
                            {n.title && !isLocked && (
                              <p className="text-[10px] sm:text-xs text-slate-400 text-center line-clamp-2 max-w-[80px] sm:max-w-[100px]">
                                {n.title}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

