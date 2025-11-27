'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function loginCoach(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { coachedClients: true },
    });

    if (!user || user.role !== 'COACH') {
      return { success: false, error: 'Invalid email or password' };
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return { success: false, error: 'Invalid email or password' };
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

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}

