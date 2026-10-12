import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { chargeLeadFeeOnFile } from '@/lib/card-on-file';
import { createNotification } from '@/lib/notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'CLIENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { lead: { select: { serviceType: true } } },
  });
  if (!conversation || conversation.clientId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const FEE_PAYMENT_HOURS = 24;

  if (conversation.status !== 'active') {
    return NextResponse.json({ error: 'This conversation is no longer open' }, { status: 409 });
  }

  // Accept this cleaner: lead → ACCEPTED, close every other conversation for it.
  //
  // The lead update is a guarded updateMany rather than a plain update, and it is
  // what makes this route safe to call twice. A lead is only confirmable while it
  // sits in IN_REVIEW, so a second click — or a confirm aimed at a conversation
  // that was already declined or closed — matches zero rows and stops here.
  // Without that guard the route would re-point the lead at an old cleaner, close
  // the conversation the client actually chose, and charge the wrong card.
  try {
    await prisma.$transaction(async tx => {
      const claimed = await tx.lead.updateMany({
        where: { id: conversation.leadId, status: 'IN_REVIEW' },
        data:  { status: 'ACCEPTED', cleanerId: conversation.cleanerId },
      });
      if (claimed.count === 0) {
        throw Object.assign(new Error('NOT_CONFIRMABLE'), { code: 'NOT_CONFIRMABLE' });
      }

      await tx.conversation.updateMany({
        where: { leadId: conversation.leadId, id: { not: id } },
        data:  { status: 'closed' },
      });
    });
  } catch (err: any) {
    if (err?.code === 'NOT_CONFIRMABLE') {
      return NextResponse.json({ error: 'This booking was already handled' }, { status: 409 });
    }
    throw err;
  }

  // Automatically charge the cleaner's card on file now that the client confirmed
  let autoCharged = false;
  if (conversation.feeStatus === 'pending' && (conversation.leadFee ?? 0) > 0) {
    const cleanerUser = await prisma.user.findUnique({
      where:  { id: conversation.cleanerId },
      select: { stripeCustomerId: true },
    });

    if (cleanerUser?.stripeCustomerId) {
      const charge = await chargeLeadFeeOnFile({
        customerId:  cleanerUser.stripeCustomerId,
        amount:      conversation.leadFee!,
        description: `Lead fee — ${conversation.lead.serviceType}`,
        // One lead fee per conversation, ever. Stripe collapses a repeat of this
        // key onto the original charge instead of taking the money twice.
        idempotencyKey: `lead-fee-${id}`,
        metadata:    {
          type:           'lead_payment',
          conversationId: id,
          cleanerId:      conversation.cleanerId,
          leadId:         conversation.leadId,
        },
      });

      if (charge.status === 'charged') {
        await prisma.conversation.update({
          where: { id },
          data:  { feeStatus: 'charged', feeDeadline: null },
        });
        autoCharged = true;
      }
      // no card / declined / needs 3DS — cleaner pays manually via the payment wall
    }

    // Auto-charge didn't happen: start the payment deadline clock.
    // advanceWaves will auto-decline and re-match if this deadline passes unpaid.
    if (!autoCharged) {
      const deadline = new Date(Date.now() + FEE_PAYMENT_HOURS * 60 * 60 * 1000);
      await prisma.conversation.update({ where: { id }, data: { feeDeadline: deadline } });
    }
  } else if (conversation.feeStatus === 'pending' && (conversation.leadFee ?? 0) <= 0) {
    // Free-lead promo: fee is $0 — waive instead of charging or starting a payment deadline.
    await prisma.conversation.update({ where: { id }, data: { feeStatus: 'waived' } });
  }

  const notifBody = autoCharged
    ? 'The client confirmed you and the lead fee was charged. Open the chat to continue.'
    : `The client accepted you! Pay the lead fee within ${FEE_PAYMENT_HOURS}h to keep the lead.`;

  createNotification({
    userId: conversation.cleanerId,
    type:   'client_accepted',
    title:  'Client accepted you!',
    body:   notifBody,
    link:   `/dashboard/chat/${id}`,
  }).catch(() => {});

  return NextResponse.json({ ok: true, conversationId: id, autoCharged });
}
