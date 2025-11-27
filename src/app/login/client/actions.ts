'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function loginClient(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { client: true },
    });

    if (!user || user.role !== 'CLIENT') {
      return { error: 'Invalid email or password' };
    }

    // Password check with bcrypt
    if (!user.password) {
      return { error: 'Invalid email or password' };
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
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
    cookieStore.set('user_role', 'CLIENT', {
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
  redirect('/client/today');
}

