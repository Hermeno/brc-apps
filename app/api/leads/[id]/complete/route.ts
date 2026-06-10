import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead || lead.clientId !== user.id)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (['COMPLETED', 'CANCELLED'].includes(lead.status))
      return NextResponse.json({ error: 'Booking already closed' }, { status: 409 });

    // Can only complete AFTER the scheduled time
    if (new Date(lead.dateTime) > new Date())
      return NextResponse.json({ error: 'The cleaning has not reached the scheduled time yet' }, { status: 409 });

    // Lead fee must be paid before marking complete
    const conv = await prisma.conversation.findFirst({
      where: { leadId: id, cleanerId: lead.cleanerId ?? undefined, status: 'active' },
      select: { feeStatus: true },
    });
    if (!conv || (conv.feeStatus !== 'charged' && conv.feeStatus !== 'waived'))
      return NextResponse.json({ error: 'Lead fee has not been paid yet' }, { status: 402 });

    // For one-time services: mark lead COMPLETED + close the active conversation
    // For recurring (weekly/biweekly): mark COMPLETED but keep conversation active
    const ops: any[] = [
      prisma.lead.update({ where: { id }, data: { status: 'COMPLETED' } }),
    ];

    if (lead.frequency === 'once') {
      ops.push(
        prisma.conversation.updateMany({
          where: { leadId: id, status: 'active' },
          data:  { status: 'closed' },
        })
      );
    }

    await prisma.$transaction(ops);

    if (lead.cleanerId) {
      createNotification({
        userId: lead.cleanerId,
        type:   'job_completed',
        title:  'Job completed!',
        body:   lead.frequency === 'once'
          ? 'The client marked the job as completed. Awaiting review.'
          : 'The client marked the cycle as completed. The chat remains active for future bookings.',
        link:   '/dashboard/cleaner',
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[POST /api/leads/[id]/complete]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
