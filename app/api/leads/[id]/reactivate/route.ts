import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { runMatching } from '@/lib/matching';
import { logError } from '@/lib/logger';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { dateTime } = await req.json();
    if (!dateTime) return NextResponse.json({ error: 'dateTime required' }, { status: 400 });

    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
      return NextResponse.json({ error: 'Please choose a future date and time' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const { id } = await params;
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead || lead.clientId !== dbUser.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const reactivatable = ['NEW', 'WAVE1', 'WAVE2', 'WAVE3', 'UNMATCHED', 'CANCELLED'];
    if (!reactivatable.includes(lead.status)) {
      return NextResponse.json({ error: 'This booking cannot be reactivated' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: 'NEW',
          dateTime: parsedDate,
          cleanerId: null,
        },
      }),
      prisma.leadDistribution.deleteMany({ where: { leadId: lead.id } }),
      prisma.conversation.updateMany({ where: { leadId: lead.id }, data: { status: 'closed' } }),
    ]);

    after(() => runMatching(lead.id).catch(e => logError('[reactivate matching]', e)));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    logError('[POST /api/leads/[id]/reactivate]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
