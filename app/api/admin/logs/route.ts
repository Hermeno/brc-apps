import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

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
    const level  = searchParams.get('level')  ?? undefined;
    const userId = searchParams.get('userId') ?? undefined;
    const take   = Math.min(parseInt(searchParams.get('take') ?? '100'), 500);

    const logs = await prisma.appLog.findMany({
      where: {
        ...(level  ? { level }  : {}),
        ...(userId ? { userId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error('[GET /api/admin/logs]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
