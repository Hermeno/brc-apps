import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation || conversation.clientId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Accept this cleaner: lead → ACCEPTED, close all other conversations
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

  // For legacy conversations created before the pay-first model, waive the fee
  if (conversation.feeStatus === 'pending' && (conversation.leadFee ?? 0) > 0) {
    await prisma.conversation.update({ where: { id }, data: { feeStatus: 'waived' } });
  }

  createNotification({
    userId: conversation.cleanerId,
    type:   'client_accepted',
    title:  'Client accepted you!',
    body:   'You were accepted. Open the chat to continue.',
    link:   `/dashboard/chat/${id}`,
  }).catch(() => {});

  return NextResponse.json({ ok: true, conversationId: id });
}
