import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (me?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const reviews = await prisma.review.findMany({
      include: {
        client:  { select: { id: true, name: true, email: true } },
        cleaner: { select: { id: true, name: true, email: true, isVerified: true } },
        lead:    { select: { serviceType: true, address: true, dateTime: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (err: any) {
    console.error('[GET /api/admin/reviews]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
