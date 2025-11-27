'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, MessageSquare, BarChart3, User } from 'lucide-react';
import { translations, Lang } from '@/lib/i18n';

export function ClientBottomNav() {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const cookieLang = document.cookie.match(/lang=([^;]+)/)?.[1] as Lang;
    if (cookieLang) setLang(cookieLang);
  }, []);

  // Don't show nav on workout execution pages
  if (pathname?.includes('/workout/')) {
    return null;
  }

  const navItems = [
    {
      href: '/client/today',
      icon: Home,
      labelEn: 'Today',
      labelEs: 'Hoy',
    },
    {
      href: '/client/program-map',
      icon: Map,
      labelEn: 'Program',
      labelEs: 'Programa',
    },
    {
      href: '/client/chat',
      icon: MessageSquare,
      labelEn: 'Chat',
      labelEs: 'Chat',
    },
    {
      href: '/client/body-measurements',
      icon: BarChart3,
      labelEn: 'Progress',
      labelEs: 'Progreso',
    },
    {
      href: '/client/badges',
      icon: User,
      labelEn: 'Profile',
      labelEs: 'Perfil',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 safe-bottom">
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/client/today' && pathname?.startsWith(item.href));
            const label = lang === 'en' ? item.labelEn : item.labelEs;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                  isActive
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
                <span className="text-[10px] font-medium leading-tight text-center">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

