import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
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

  // Accept this cleaner: lead → ACCEPTED, close all other conversations for this lead
  await prisma.$transaction([
    prisma.lead.update({
      where: { id: conversation.leadId },
      data:  { status: 'ACCEPTED', cleanerId: conversation.cleanerId },
    }),
    prisma.conversation.updateMany({
      where: { leadId: conversation.leadId, id: { not: id } },
      data:  { status: 'closed' },
    }),
    prisma.conversation.update({ where: { id }, data: { status: 'active' } }),
  ]);

  // Automatically charge the cleaner now that the client confirmed
  let autoCharged = false;
  if (conversation.feeStatus === 'pending' && (conversation.leadFee ?? 0) > 0) {
    const cleanerUser = await prisma.user.findUnique({
      where:  { id: conversation.cleanerId },
      select: { stripeCustomerId: true },
    });

    if (cleanerUser?.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(cleanerUser.stripeCustomerId);
        const defaultPM =
          !('deleted' in customer) &&
          typeof customer.invoice_settings?.default_payment_method === 'string'
            ? customer.invoice_settings.default_payment_method
            : null;

        if (defaultPM) {
          const pi = await stripe.paymentIntents.create({
            amount:         Math.round(conversation.leadFee! * 100),
            currency:       'usd',
            customer:       cleanerUser.stripeCustomerId,
            payment_method: defaultPM,
            confirm:        true,
            off_session:    true,
            description:    `Lead fee — ${conversation.lead.serviceType}`,
            metadata:       { type: 'lead_payment', conversationId: id, cleanerId: conversation.cleanerId, leadId: conversation.leadId },
          });
          if (pi.status === 'succeeded') {
            await prisma.conversation.update({ where: { id }, data: { feeStatus: 'charged' } });
            autoCharged = true;
          }
        }
      } catch {
        // Card declined or no saved card — cleaner pays manually via payment wall
      }
    }

    // Auto-charge didn't happen: start the payment deadline clock.
    // advanceWaves will auto-decline and re-match if this deadline passes unpaid.
    if (!autoCharged) {
      const deadline = new Date(Date.now() + FEE_PAYMENT_HOURS * 60 * 60 * 1000);
      await prisma.conversation.update({ where: { id }, data: { feeDeadline: deadline } });
    }
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
