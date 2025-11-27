import { cookies } from 'next/headers';
import { Lang } from '@/lib/i18n';
import ClientLoginClient from './login-client';

export default async function ClientLoginPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Lang) || 'en';
  
  return <ClientLoginClient initialLang={lang} />;
}
