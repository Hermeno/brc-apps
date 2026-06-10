import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        role: true,
        leadsAccepted: {
          where: { status: { in: ['ACCEPTED', 'COMPLETED'] } },
          include: {
            client: { select: { name: true } },
            review: { select: { rating: true, comment: true } },
          },
          orderBy: { dateTime: 'asc' },
        },
      },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ jobs: user.leadsAccepted });
  } catch (err: any) {
    logError('[GET /api/schedule]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
