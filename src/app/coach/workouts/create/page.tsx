import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LanguageToggle } from '@/components/LanguageToggle';
import WorkoutDesignerEnhanced from './workout-designer-enhanced';

export const dynamic = 'force-dynamic';

export default async function CreateWorkoutPage() {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 safe-top safe-bottom">
      <div className="flex justify-end p-4 absolute top-0 right-0 z-10">
        <LanguageToggle currentLang={lang} />
      </div>
      <WorkoutDesignerEnhanced coachId={user.id} lang={lang} />
    </main>
  );
}

