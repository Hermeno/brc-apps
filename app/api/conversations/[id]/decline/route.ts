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
  const conv = await prisma.conversation.findUnique({ where: { id } });

  if (!conv || conv.clientId !== user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.conversation.update({ where: { id }, data: { status: 'declined' } });

  // Refund the cleaner if they already paid for this lead
  if (conv.feeStatus === 'charged' && (conv.leadFee ?? 0) > 0) {
    try {
      const pis = await stripe.paymentIntents.search({
        query: `metadata['leadId']:'${conv.leadId}' AND metadata['cleanerId']:'${conv.cleanerId}' AND status:'succeeded'`,
        limit: 1,
      });
      if (pis.data.length > 0) {
        await stripe.refunds.create({ payment_intent: pis.data[0].id });
      }
    } catch (e) {
      console.error('[decline] refund error:', e);
    }
  }

  // If no other active conversations → revert lead to WAVE1 for redistribution
  const remaining = await prisma.conversation.count({
    where: { leadId: conv.leadId, status: 'active', id: { not: id } },
  });

  if (remaining === 0) {
    const lead = await prisma.lead.findUnique({ where: { id: conv.leadId } });
    if (lead && ['IN_REVIEW', 'ACCEPTED'].includes(lead.status)) {
      // No cleaners left — revert so a new wave can be triggered
      await prisma.lead.update({ where: { id: conv.leadId }, data: { status: 'WAVE1', cleanerId: null } });
      // Expire any pending distributions so advanceWaves picks up a fresh wave
      await prisma.leadDistribution.updateMany({
        where: { leadId: conv.leadId, status: 'INVITED' },
        data:  { status: 'EXPIRED' },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
