import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const jobs = await prisma.lead.findMany({
    where: {
      cleanerId: user.id,
      status: { in: ['ACCEPTED', 'COMPLETED'] },
    },
    include: {
      client: { select: { name: true, email: true, phone: true } },
      review: { select: { rating: true, comment: true } },
    },
    orderBy: { dateTime: 'asc' },
  });

  return NextResponse.json({ jobs });
}
