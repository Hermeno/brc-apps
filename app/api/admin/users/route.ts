import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
    if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const users = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        address: true, zipCode: true, latitude: true, longitude: true,
        isVerified: true, suspendedUntil: true,
        createdAt: true, plan: true, isAvailable: true,
        verification: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    logError('[GET /api/admin/users]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
