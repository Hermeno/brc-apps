import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? undefined;

    const disputes = await prisma.dispute.findMany({
      where:   status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        client:  { select: { id: true, name: true, email: true } },
        cleaner: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ disputes });
  } catch (err: any) {
    logError('[GET /api/admin/disputes]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
