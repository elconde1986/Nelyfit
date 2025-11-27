import { cookies } from 'next/headers';
import { Lang } from '@/lib/i18n';

export async function getLangFromServer(): Promise<Lang> {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('lang');
  return (langCookie?.value as Lang) || 'en';
}

