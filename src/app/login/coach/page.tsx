import { cookies } from 'next/headers';
import { Lang } from '@/lib/i18n';
import CoachLoginClient from './login-client';

export default async function CoachLoginPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Lang) || 'en';
  
  return <CoachLoginClient initialLang={lang} />;
}
