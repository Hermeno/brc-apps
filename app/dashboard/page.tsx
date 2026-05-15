import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Redirect based on role
  const role = (session.user as any).role;
  
  if (role === 'ADMIN') {
    redirect('/dashboard/admin');
  } else if (role === 'CLEANER') {
    redirect('/dashboard/cleaner');
  } else {
    redirect('/dashboard/client');
  }
}
