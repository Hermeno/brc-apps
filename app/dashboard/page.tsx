import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;

  if (role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  if (role === 'CLIENT') {
    redirect('/dashboard/client');
  }

  if (role === 'CLEANER') {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { serviceTypes: true },
    });

    // New cleaner with no services configured → show onboarding wizard
    if (!user || user.serviceTypes.length === 0) {
      redirect('/dashboard/onboarding');
    }

    redirect('/dashboard/cleaner');
  }

  redirect('/dashboard/client');
}
