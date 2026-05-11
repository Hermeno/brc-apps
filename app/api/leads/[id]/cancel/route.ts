import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead || lead.clientId !== user.id)
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  if (['COMPLETED', 'CANCELLED'].includes(lead.status))
    return NextResponse.json({ error: 'Pedido já encerrado' }, { status: 409 });

  // Can only cancel before the scheduled time
  if (new Date(lead.dateTime) < new Date())
    return NextResponse.json({ error: 'Tempo esgotado — use "Terminar" após a hora marcada' }, { status: 409 });

  await prisma.$transaction([
    prisma.lead.update({ where: { id }, data: { status: 'CANCELLED' } }),
    prisma.conversation.updateMany({ where: { leadId: id }, data: { status: 'closed' } }),
  ]);

  return NextResponse.json({ ok: true });
}
