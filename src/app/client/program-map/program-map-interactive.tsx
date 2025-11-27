'use client';

import { useRouter } from 'next/navigation';
import { Dumbbell, Coffee, CheckCircle2, Lock } from 'lucide-react';
import { translations, Lang } from '@/lib/i18n';

type Node = {
  id: string;
  dayIndex: number;
  title: string;
  isRest: boolean;
  status: 'completed' | 'current' | 'locked' | 'rest';
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function ProgramMapInteractive({
  nodes,
  programStartDate,
  lang,
}: {
  nodes: Node[];
  programStartDate: Date | null;
  lang: Lang;
}) {
  const router = useRouter();
  const t = translations.client[lang] || translations.client.en;

  const handleDayClick = (node: Node) => {
    if (node.status === 'locked' || node.status === 'rest') return;

    if (!programStartDate) return;

    // Calculate the date for this day
    const start = startOfDay(programStartDate);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + node.dayIndex - 1);
    const dateStr = targetDate.toISOString().split('T')[0];

    // Navigate to day details
    router.push(`/client/program-map/day/${dateStr}`);
  };

  return (
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
                const isClickable = !isRest && !isLocked;
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
                    className={`flex flex-col items-center justify-center gap-2 transition-transform duration-200 relative ${isCurrent ? 'z-10' : ''}`}
                  >
                    {/* Connection line (except first day of week) */}
                    {dayIdx > 0 && (
                      <div className="absolute left-0 top-1/2 w-3 sm:w-4 h-0.5 bg-slate-700 -translate-x-full" />
                    )}
                    <button
                      onClick={() => handleDayClick(n)}
                      disabled={!isClickable}
                      className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${bg} ${shadow} ${scale} relative ${
                        isClickable
                          ? 'cursor-pointer hover:scale-105 active:scale-95'
                          : 'cursor-not-allowed'
                      } ${isCompleted && isClickable ? 'animate-pulse' : ''}`}
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
                    </button>
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
  );
}

