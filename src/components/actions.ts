'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Lang } from '@/lib/i18n';

export async function setLanguage(lang: Lang, path: string) {
  const cookieStore = await cookies();
  cookieStore.set('lang', lang, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  revalidatePath(path);
}

