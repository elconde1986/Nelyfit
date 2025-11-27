import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ClientBottomNav } from './client-bottom-nav';

export const dynamic = 'force-dynamic';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth('CLIENT');
  
  if (!user || !user.clientId) {
    redirect('/login/client');
  }

  return (
    <>
      {children}
      <ClientBottomNav />
    </>
  );
}

