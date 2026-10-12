import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { runMatching } from '@/lib/matching';
import { createNotification } from '@/lib/notifications';
import { resolveFeeOnCancellation } from '@/lib/lead-fee';
import { after } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const conv = await prisma.conversation.findUnique({ where: { id } });

  if (!conv || conv.clientId !== user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Declining twice must not run any of this again.
  if (conv.status !== 'active')
    return NextResponse.json({ error: 'This conversation is no longer open' }, { status: 409 });

  // A settled fee stays settled — see lib/lead-fee.ts for why the automatic
  // refund that used to live here was the hole that made the platform free.
  const fee = resolveFeeOnCancellation(conv.feeStatus);

  // Guard the transition itself, so two declines racing cannot both proceed.
  const declined = await prisma.conversation.updateMany({
    where: { id, status: 'active' },
    data:  { status: 'declined', feeStatus: fee.feeStatus },
  });
  if (declined.count === 0)
    return NextResponse.json({ error: 'This conversation is no longer open' }, { status: 409 });

  if (conv.feeStatus === 'charged') {
    createNotification({
      userId: conv.cleanerId,
      type:   'lead_declined',
      title:  'The client chose someone else',
      body:   fee.reason,
      link:   '/dashboard/cleaner',
    }).catch(() => {});
  }

  // If no other active conversations → revert lead to NEW and re-run matching
  const remaining = await prisma.conversation.count({
    where: { leadId: conv.leadId, status: 'active', id: { not: id } },
  });

  if (remaining === 0) {
    const lead = await prisma.lead.findUnique({ where: { id: conv.leadId } });
    if (lead && ['IN_REVIEW', 'ACCEPTED'].includes(lead.status)) {
      await prisma.$transaction([
        prisma.lead.update({ where: { id: conv.leadId }, data: { status: 'NEW', cleanerId: null } }),
        prisma.leadDistribution.updateMany({
          where: { leadId: conv.leadId, status: 'INVITED' },
          data:  { status: 'EXPIRED' },
        }),
      ]);
      // Re-run matching so cleaners are notified immediately — no manual reactivation needed
      after(() => runMatching(conv.leadId).catch(e => logError('[decline rematch]', e)));
    }
  }

  return NextResponse.json({ ok: true });
}
