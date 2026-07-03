import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const blocks = await prisma.scheduleBlock.findMany({
      where:   { cleanerId: user.id, endTime: { gte: new Date() } },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ blocks });
  } catch (err: any) {
    logError('[GET /api/schedule/block]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { startTime, endTime, reason } = body;

    if (!startTime || !endTime) {
      return NextResponse.json({ error: 'startTime and endTime are required' }, { status: 400 });
    }
    const start = new Date(startTime);
    const end   = new Date(endTime);
    if (start >= end) {
      return NextResponse.json({ error: 'endTime must be after startTime' }, { status: 400 });
    }

    const block = await prisma.scheduleBlock.create({
      data: { cleanerId: user.id, startTime: start, endTime: end, reason },
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (err: any) {
    logError('[POST /api/schedule/block]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
