import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/conversations — list conversations for current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: user.role === 'CLIENT'
        ? { clientId: user.id }
        : { cleanerId: user.id },
      include: {
        lead:    { select: { serviceType: true, address: true, dateTime: true, status: true, isInstantBook: true } },
        client:  { select: { name: true, email: true } },
        cleaner: { select: { name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ conversations, role: user.role });
  } catch (err: any) {
    console.error('[GET /api/conversations]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
