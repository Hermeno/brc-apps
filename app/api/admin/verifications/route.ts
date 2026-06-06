import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const verifications = await prisma.cleanerVerification.findMany({
      include: {
        cleaner: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ verifications });
  } catch (err: any) {
    console.error('[GET /api/admin/verifications]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
