'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function loginCoach(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      include: { coachedClients: true },
    });

    if (!user || (user.role !== 'COACH' && user.role !== 'ADMIN')) {
      return { error: 'Invalid email or password' };
    }

    // Check user status
    if (user.status === 'INACTIVE') {
      return { error: 'Account is inactive. Please contact support.' };
    }

    if (user.status === 'PENDING') {
      return { error: 'Account is pending activation. Please contact support.' };
    }

    // Password check with bcrypt
    if (!user.password) {
      return { error: 'Invalid email or password' };
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { error: 'Invalid email or password' };
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    cookieStore.set('user_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login' };
  }

  // Redirect based on role
  if (user && user.role === 'ADMIN') {
    redirect('/admin/dashboard');
  } else {
    redirect('/coach/dashboard');
  }
}

