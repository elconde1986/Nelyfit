import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import { MacroCalculatorClient } from './macro-calculator-client';

export const dynamic = 'force-dynamic';

export default async function MacroCalculatorPage() {
  const user = await requireAuth();
  if (!user) redirect('/login/client');

  const lang = getLang();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-end mb-4">
          <LanguageToggle currentLang={lang} />
        </div>
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className="gradient-text">
              {lang === 'en' ? 'Macro Calculator' : 'Calculadora de Macros'}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'en'
              ? 'Calculate your daily macronutrient needs based on your goals'
              : 'Calcula tus necesidades diarias de macronutrientes según tus objetivos'}
          </p>
        </header>
        <MacroCalculatorClient lang={lang} />
      </div>
    </main>
  );
}

