import { cookies } from 'next/headers';
import { Lang } from '@/lib/i18n';
import SignupClient from './signup-client';

export default async function SignupPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Lang) || 'en';
  
  return <SignupClient initialLang={lang} />;
}

