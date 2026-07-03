import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logError, logInfo } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const body   = await req.json();
    const { status, resolution } = body;

    const validStatuses = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        status,
        resolution: resolution ?? undefined,
        resolvedBy: status === 'RESOLVED' || status === 'CLOSED' ? admin.id : undefined,
        resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : undefined,
      },
    });

    logInfo('[disputes]', `Dispute ${id} updated to ${status}`, { resolution }, admin.id);

    return NextResponse.json({ dispute });
  } catch (err: any) {
    logError('[PATCH /api/disputes/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
