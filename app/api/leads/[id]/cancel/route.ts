import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { resolveFeeOnCancellation } from '@/lib/lead-fee';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead || lead.clientId !== user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (['COMPLETED', 'CANCELLED'].includes(lead.status))
    return NextResponse.json({ error: 'Booking already closed' }, { status: 409 });

  // Can only cancel before the scheduled time
  if (new Date(lead.dateTime) < new Date())
    return NextResponse.json({ error: 'Time passed — use "Complete" after the scheduled time' }, { status: 409 });

  // Cannot cancel after the cleaner has paid the lead fee
  const paidConv = await prisma.conversation.findFirst({
    where: { leadId: id, feeStatus: { in: ['charged', 'waived'] }, status: 'active' },
    select: { id: true },
  });
  if (paidConv)
    return NextResponse.json({ error: 'Cannot cancel after the cleaner has paid the lead fee' }, { status: 409 });

  await prisma.$transaction([
    prisma.lead.update({ where: { id }, data: { status: 'CANCELLED' } }),
    prisma.conversation.updateMany({ where: { leadId: id }, data: { status: 'closed' } }),
  ]);

  // Any cleaner who paid for this lead keeps nothing back: the check above
  // already refuses to cancel while a paid conversation is active, so whoever
  // reaches this point was charged for a conversation that has since closed and
  // has had the client's contact details all along. See lib/lead-fee.ts.
  const paidConvs = await prisma.conversation.findMany({
    where:  { leadId: id, feeStatus: 'charged', leadFee: { gt: 0 } },
    select: { id: true, cleanerId: true },
  });

  for (const conv of paidConvs) {
    const fee = resolveFeeOnCancellation('charged');
    createNotification({
      userId: conv.cleanerId,
      type:   'lead_declined',
      title:  'The client cancelled this booking',
      body:   fee.reason,
      link:   '/dashboard/cleaner',
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
