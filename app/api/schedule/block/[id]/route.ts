import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;

    const block = await prisma.scheduleBlock.findUnique({ where: { id } });
    if (!block) return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    if (block.cleanerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.scheduleBlock.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    logError('[DELETE /api/schedule/block/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
