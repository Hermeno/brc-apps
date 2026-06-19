import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function AppEntryPage() {
  const session = await auth();
  
  // Redirect authenticated users to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }
  
  // Redirect unauthenticated users to home
  redirect('/');
}
