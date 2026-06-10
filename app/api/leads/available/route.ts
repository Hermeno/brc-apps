import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        role: true,
        cleanerConvos: {
          where: { status: 'active' },
          include: { lead: { include: { client: { select: { name: true } } } } },
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!dbUser || dbUser.role !== 'CLEANER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [available, accepted] = await Promise.all([
      prisma.lead.findMany({
        where: {
          status: { in: ['WAVE2', 'WAVE3', 'NEW', 'IN_REVIEW'] },
          distributions: { some: { cleanerId: dbUser.id, status: 'INVITED' } },
          conversations: { none: { cleanerId: dbUser.id } },
        },
        include: {
          client: { select: { name: true } },
          distributions: {
            where: { cleanerId: dbUser.id },
            select: { id: true, status: true, wave: true, expiresAt: true, notifiedAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.findMany({
        where: { cleanerId: dbUser.id, status: { in: ['IN_REVIEW', 'ACCEPTED', 'COMPLETED'] } },
        include: { client: { select: { name: true } } },
        orderBy: { dateTime: 'asc' },
      }),
    ]);

    return NextResponse.json({ available, accepted, conversations: dbUser.cleanerConvos });
  } catch (err: any) {
    logError('[leads/available]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
