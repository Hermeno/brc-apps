import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!dbUser || dbUser.role !== 'CLEANER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [available, accepted, myConversations] = await Promise.all([
      prisma.lead.findMany({
        where: {
          status: { in: ['WAVE1', 'WAVE2', 'WAVE3', 'NEW', 'IN_REVIEW'] },
          distributions: { some: { cleanerId: dbUser.id, status: 'INVITED' } },
          conversations: { none: { cleanerId: dbUser.id } },
        },
        include: {
          client: { select: { name: true } },
          distributions: { where: { cleanerId: dbUser.id } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.findMany({
        where: { cleanerId: dbUser.id, status: { in: ['IN_REVIEW', 'ACCEPTED', 'COMPLETED'] } },
        include: { client: { select: { name: true } } },
        orderBy: { dateTime: 'asc' },
      }),
      prisma.conversation.findMany({
        where: { cleanerId: dbUser.id, status: 'active' },
        include: {
          lead: { include: { client: { select: { name: true } } } },
        },
        orderBy: { id: 'desc' },
      }),
    ]);

    return NextResponse.json({ available, accepted, conversations: myConversations });
  } catch (err: any) {
    console.error('[leads/available]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
