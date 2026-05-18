import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
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

  // Can only complete AFTER the scheduled time
  if (new Date(lead.dateTime) > new Date())
    return NextResponse.json({ error: 'A limpeza ainda não chegou no horário marcado' }, { status: 409 });

  // For one-time services: mark lead COMPLETED + close the active conversation
  // For recurring (weekly/biweekly): mark COMPLETED but keep conversation active
  const ops: any[] = [
    prisma.lead.update({ where: { id }, data: { status: 'COMPLETED' } }),
  ];

  if (lead.frequency === 'once') {
    ops.push(
      prisma.conversation.updateMany({
        where: { leadId: id, status: 'active' },
        data:  { status: 'closed' },
      })
    );
  }

  await prisma.$transaction(ops);

  if (lead.cleanerId) {
    createNotification({
      userId: lead.cleanerId,
      type:   'job_completed',
      title:  'Trabalho concluído!',
      body:   lead.frequency === 'once'
        ? 'O cliente marcou o serviço como concluído. Aguarde a avaliação.'
        : 'O cliente marcou o ciclo como concluído. O chat permanece ativo para os próximos agendamentos.',
      link:   '/dashboard/cleaner',
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
