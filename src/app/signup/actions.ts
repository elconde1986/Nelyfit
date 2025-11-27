'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { redeemTemporaryCode } from '@/lib/temporary-codes';
import bcrypt from 'bcryptjs';

export async function signup(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  accessCode?: string;
}) {
  try {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        authProvider: 'EMAIL',
        role: 'CLIENT',
      },
    });

    // Create client profile
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        userId: user.id,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { clientId: client.id },
    });

    // Redeem access code if provided
    if (data.accessCode) {
      try {
        await redeemTemporaryCode(data.accessCode, user.id);
      } catch (err) {
        // Continue even if code redemption fails
        console.error('Code redemption failed:', err);
      }
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set('user_role', 'CLIENT', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return { success: false, error: error.message || 'Signup failed' };
  }

  redirect('/client/today');
}

