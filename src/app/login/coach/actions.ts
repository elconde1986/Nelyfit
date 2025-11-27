'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function loginCoach(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { coachedClients: true },
    });

    if (!user || user.role !== 'COACH') {
      return { error: 'Invalid email or password' };
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return { error: 'Invalid email or password' };
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    cookieStore.set('user_role', 'COACH', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login' };
  }

  // Redirect must be called outside try-catch
  redirect('/coach/dashboard');
}

