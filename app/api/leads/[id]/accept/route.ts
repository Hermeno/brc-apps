import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (lead.status !== 'NEW') {
    return NextResponse.json({ error: 'This booking was already accepted by another cleaner' }, { status: 409 });
  }

  try {
    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        cleanerId: dbUser.id,
      },
    });

    return NextResponse.json({ lead: updated });
  } catch (err: any) {
    console.error('[POST /api/leads/accept] error:', err);
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 });
  }
}
