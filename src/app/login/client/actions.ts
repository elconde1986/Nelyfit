'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function loginClient(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    console.log('[LOGIN] Attempting login for:', email);
    console.log('[LOGIN] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('[LOGIN] DATABASE_URL type:', process.env.DATABASE_URL?.substring(0, 20));

    const user = await prisma.user.findUnique({
      where: { email },
      include: { client: true },
    });

    console.log('[LOGIN] User found:', !!user);
    if (user) {
      console.log('[LOGIN] User role:', user.role);
      console.log('[LOGIN] Has password:', !!user.password);
      console.log('[LOGIN] Password length:', user.password?.length || 0);
    }

    if (!user || user.role !== 'CLIENT') {
      console.log('[LOGIN] Error: User not found or wrong role');
      return { error: 'Invalid email or password' };
    }

    // Check user status
    if (user.status === 'INACTIVE') {
      console.log('[LOGIN] Error: User account is inactive');
      return { error: 'Account is inactive. Please contact support.' };
    }

    if (user.status === 'PENDING') {
      console.log('[LOGIN] Error: User account is pending');
      return { error: 'Account is pending activation. Please contact support.' };
    }

    // Password check with bcrypt
    if (!user.password) {
      console.log('[LOGIN] Error: User has no password');
      return { error: 'Invalid email or password' };
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password match:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('[LOGIN] Error: Password mismatch');
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

