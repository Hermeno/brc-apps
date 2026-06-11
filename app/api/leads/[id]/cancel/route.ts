import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
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

  // Refund any cleaners who paid for this lead and mark feeStatus accordingly
  const paidConvs = await prisma.conversation.findMany({
    where: { leadId: id, feeStatus: 'charged', leadFee: { gt: 0 } },
    select: { id: true, cleanerId: true },
  });
  for (const conv of paidConvs) {
    try {
      const pis = await stripe.paymentIntents.search({
        query: `metadata['leadId']:'${id}' AND metadata['cleanerId']:'${conv.cleanerId}' AND status:'succeeded'`,
        limit: 1,
      });
      if (pis.data.length > 0) {
        await stripe.refunds.create({ payment_intent: pis.data[0].id });
        await prisma.conversation.update({
          where: { id: conv.id },
          data: { feeStatus: 'refunded' },
        });
      }
    } catch (e) {
      console.error('[cancel] refund error:', e);
      // feeStatus stays 'charged' so the refund can be identified and retried
    }
  }

  return NextResponse.json({ ok: true });
}
