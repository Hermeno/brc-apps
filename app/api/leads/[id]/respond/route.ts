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

  // Only accept if lead is still in an open (un-claimed) state
  const openStatuses = ['NEW', 'WAVE2', 'WAVE3'];
  if (!openStatuses.includes(lead.status)) {
    return NextResponse.json({ error: 'This lead has already been claimed' }, { status: 409 });
  }

  // Make sure this cleaner was actually invited
  const dist = lead.distributions[0];
  if (!dist || dist.status === 'EXPIRED' || dist.status === 'LOST') {
    return NextResponse.json({ error: 'You were not invited to this lead or the time has expired' }, { status: 409 });
  }

  const waveNum   = dist.wave;
  const leadPrice = lead.leadPrice ?? 15;

  let conversationId = '';

  try {
    await prisma.$transaction(async tx => {
      // Atomically claim the lead — only succeeds if status is still open.
      // If another cleaner won the race, this update matches 0 rows and we throw.
      const claimed = await tx.lead.updateMany({
        where: { id: leadId, status: { in: ['NEW', 'WAVE2', 'WAVE3'] } },
        data:  { status: 'IN_REVIEW', cleanerId: cleaner.id },
      });
      if (claimed.count === 0) {
        throw Object.assign(new Error('LEAD_TAKEN'), { code: 'LEAD_TAKEN' });
      }

      const conv = await tx.conversation.create({
        data: { leadId, clientId: lead.clientId, cleanerId: cleaner.id, leadFee: leadPrice, feeStatus: 'pending' },
      });
      conversationId = conv.id;

      // Mark this distribution as accepted
      await tx.leadDistribution.updateMany({
        where: { leadId, cleanerId: cleaner.id, wave: waveNum },
        data:  { status: 'ACCEPTED', respondedAt: new Date() },
      });

      // Lock out all other invited cleaners for this lead
      await tx.leadDistribution.updateMany({
        where: { leadId, cleanerId: { not: cleaner.id }, status: 'INVITED' },
        data:  { status: 'LOST' },
      });

      await tx.cleanerStats.upsert({
        where:  { cleanerId: cleaner.id },
        create: { cleanerId: cleaner.id, totalLeads: 1 },
        update: { totalLeads: { increment: 1 } },
      });
    });
  } catch (txErr: any) {
    if (txErr.code === 'LEAD_TAKEN' || txErr.message === 'LEAD_TAKEN') {
      return NextResponse.json({ error: 'Another cleaner already accepted this lead' }, { status: 409 });
    }
    if (txErr.code === 'P2002') {
      // Race: this cleaner's own conversation was created by a parallel request
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
