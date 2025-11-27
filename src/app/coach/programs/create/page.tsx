import { requireAuth, getLang } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProgramCreateClient from './program-create-client';

export const dynamic = 'force-dynamic';

export default async function CreateProgramPage() {
  const user = await requireAuth('COACH');
  
  if (!user) {
    redirect('/login/coach');
  }

  const lang = getLang();

  return <ProgramCreateClient coachId={user.id} lang={lang} />;
}

