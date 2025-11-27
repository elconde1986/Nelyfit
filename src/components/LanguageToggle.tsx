'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import { Lang } from '@/lib/i18n';
import { setLanguage } from './actions';

export function LanguageToggle({ currentLang }: { currentLang: Lang }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLanguageChange(lang: Lang) {
    await setLanguage(lang, pathname);
    router.refresh();
  }

  return (
    <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/60 p-1 backdrop-blur-sm">
      <button
        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
          currentLang === 'en'
            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        onClick={() => handleLanguageChange('en')}
      >
        <Languages className="w-3 h-3" />
        EN
      </button>
      <button
        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
          currentLang === 'es'
            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        onClick={() => handleLanguageChange('es')}
      >
        <Languages className="w-3 h-3" />
        ES
      </button>
    </div>
  );
}

