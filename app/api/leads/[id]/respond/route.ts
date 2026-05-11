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
    select: { id: true, role: true },
  });
  if (!cleaner || cleaner.role !== 'CLEANER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: leadId } = await params;

  // Already responded → return existing conversation
  const existing = await prisma.conversation.findUnique({
    where: { leadId_cleanerId: { leadId, cleanerId: cleaner.id } },
  });
  if (existing) {
    return NextResponse.json({ conversationId: existing.id, alreadyResponded: true, won: true });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { distributions: { where: { cleanerId: cleaner.id } } },
  });

  if (!lead) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });

  const openStatuses = ['NEW', 'WAVE1', 'WAVE2', 'WAVE3', 'IN_REVIEW'];
  if (!openStatuses.includes(lead.status)) {
    return NextResponse.json({ error: 'Este lead não está mais disponível' }, { status: 409 });
  }

  const dist = lead.distributions[0];
  if (!dist || dist.status === 'EXPIRED' || dist.status === 'LOST') {
    return NextResponse.json({ error: 'Você não foi convidado para este lead ou o tempo expirou' }, { status: 409 });
  }

  const leadPrice = lead.leadPrice ?? 15;

  try {
    // ── Wave 2: first-come-first-served race ──────────────────────────────────
    if (dist.wave === 2) {
      let result: { won: boolean; conversationId?: string } = { won: false };

      await prisma.$transaction(async tx => {
        const fresh = await tx.lead.findUnique({ where: { id: leadId } });
        if (!fresh) throw new Error('Lead não encontrado');

        // Another cleaner already locked this lead
        if (fresh.status === 'ACCEPTED' || (fresh.status === 'IN_REVIEW' && fresh.cleanerId)) {
          await tx.leadDistribution.updateMany({
            where: { leadId, cleanerId: cleaner.id, wave: 2 },
            data:  { status: 'LOST' },
          });
          result = { won: false };
          return;
        }

        const conv = await tx.conversation.create({
          data: { leadId, clientId: lead.clientId, cleanerId: cleaner.id, leadFee: leadPrice, feeStatus: 'pending' },
        });

        // IN_REVIEW: cleaner responded, waiting for client to confirm
        await tx.lead.update({
          where: { id: leadId },
          data:  { status: 'IN_REVIEW', cleanerId: cleaner.id },
        });

        await tx.leadDistribution.updateMany({
          where: { leadId, wave: 2, cleanerId: cleaner.id },
          data:  { status: 'ACCEPTED', respondedAt: new Date() },
        });
        await tx.leadDistribution.updateMany({
          where: { leadId, wave: 2, cleanerId: { not: cleaner.id } },
          data:  { status: 'LOST' },
        });

        await tx.cleanerStats.upsert({
          where:  { cleanerId: cleaner.id },
          create: { cleanerId: cleaner.id, totalLeads: 1 },
          update: { totalLeads: { increment: 1 } },
        });

        result = { won: true, conversationId: conv.id };
      });

      if (!result.won) {
        return NextResponse.json({
          won: false,
          message: 'Outro profissional foi mais rápido. Você não foi cobrado.',
        }, { status: 409 });
      }

        // Notify client
      createNotification({
        userId: lead.clientId,
        type:   'cleaner_responded',
        title:  'Profissional disponível!',
        body:   'Um profissional respondeu ao seu pedido. Aceite ou recuse.',
        link:   '/dashboard/client',
      }).catch(() => {});

      return NextResponse.json({ won: true, conversationId: result.conversationId, leadFee: leadPrice });
    }

    // ── Wave 1 (exclusive window) ─────────────────────────────────────────────
    const [conv] = await prisma.$transaction([
      prisma.conversation.create({
        data: { leadId, clientId: lead.clientId, cleanerId: cleaner.id, leadFee: leadPrice, feeStatus: 'pending' },
      }),
      prisma.lead.update({
        where: { id: leadId },
        data:  { status: 'IN_REVIEW', cleanerId: cleaner.id },
      }),
      prisma.leadDistribution.updateMany({
        where: { leadId, cleanerId: cleaner.id, wave: dist.wave },
        data:  { status: 'ACCEPTED', respondedAt: new Date() },
      }),
      prisma.cleanerStats.upsert({
        where:  { cleanerId: cleaner.id },
        create: { cleanerId: cleaner.id, totalLeads: 1 },
        update: { totalLeads: { increment: 1 } },
      }),
    ]);

    // Notify client (wave 1)
    createNotification({
      userId: lead.clientId,
      type:   'cleaner_responded',
      title:  'Profissional disponível!',
      body:   'Um profissional respondeu ao seu pedido. Aceite ou recuse.',
      link:   '/dashboard/client',
    }).catch(() => {});

    return NextResponse.json({ won: true, conversationId: conv.id, leadFee: leadPrice });

  } catch (err: any) {
    if (err.code === 'P2002') {
      const conv = await prisma.conversation.findUnique({
        where: { leadId_cleanerId: { leadId, cleanerId: cleaner.id } },
      });
      return NextResponse.json({ conversationId: conv?.id, alreadyResponded: true, won: true });
    }
    console.error('[respond]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
