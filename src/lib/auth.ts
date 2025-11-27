import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const userRole = cookieStore.get('user_role')?.value;

    if (!userId || !userRole) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        coachedClients: true,
      },
    });

    if (!user || user.role !== userRole) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function requireAuth(requiredRole?: 'COACH' | 'CLIENT') {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return user;
}

