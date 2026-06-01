import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cleaner = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, email: true, name: true },
  });
  if (!cleaner || cleaner.role !== 'CLEANER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: leadId } = await params;

  // Already responded → redirect to existing conversation
  const existing = await prisma.conversation.findUnique({
    where: { leadId_cleanerId: { leadId, cleanerId: cleaner.id } },
  });
  if (existing) {
    return NextResponse.json({ conversationId: existing.id, alreadyResponded: true });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { distributions: { where: { cleanerId: cleaner.id } } },
  });

  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const openStatuses = ['NEW', 'WAVE1', 'WAVE2', 'WAVE3', 'IN_REVIEW'];
  if (!openStatuses.includes(lead.status)) {
    return NextResponse.json({ error: 'This lead is no longer available' }, { status: 409 });
  }

  const dist = lead.distributions[0];
  if (!dist || dist.status === 'EXPIRED' || dist.status === 'LOST') {
    return NextResponse.json({ error: 'You were not invited to this lead or the time has expired' }, { status: 409 });
  }

  // Lead already accepted by another cleaner
  if (dist.wave === 2 && lead.status === 'ACCEPTED') {
    return NextResponse.json({ error: 'Another cleaner already accepted this lead' }, { status: 409 });
  }

  const waveNum  = dist.wave;
  const leadPrice = lead.leadPrice ?? 15;

  let conversationId = '';

  try {
    await prisma.$transaction(async tx => {
      const conv = await tx.conversation.create({
        data: { leadId, clientId: lead.clientId, cleanerId: cleaner.id, leadFee: leadPrice, feeStatus: 'pending' },
      });
      conversationId = conv.id;

      // Move lead to IN_REVIEW; only set cleanerId if not already claimed by another responder
      await tx.lead.update({
        where: { id: leadId },
        data: {
          status: 'IN_REVIEW',
          ...(lead.cleanerId ? {} : { cleanerId: cleaner.id }),
        },
      });

      await tx.leadDistribution.updateMany({
        where: { leadId, cleanerId: cleaner.id, wave: waveNum },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
      });

      await tx.cleanerStats.upsert({
        where:  { cleanerId: cleaner.id },
        create: { cleanerId: cleaner.id, totalLeads: 1 },
        update: { totalLeads: { increment: 1 } },
      });
    });
  } catch (txErr: any) {
    if (txErr.code === 'P2002') {
      // Race: conversation already created by a parallel request
      const raced = await prisma.conversation.findUnique({
        where: { leadId_cleanerId: { leadId, cleanerId: cleaner.id } },
      });
      if (raced) return NextResponse.json({ conversationId: raced.id, alreadyResponded: true });
    }
    throw txErr;
  }

  createNotification({
    userId: lead.clientId,
    type:   'cleaner_responded',
    title:  'Cleaner available!',
    body:   'A professional responded to your request. Accept or decline.',
    link:   '/dashboard/client',
  }).catch(() => {});

  return NextResponse.json({ conversationId, won: true });
}
