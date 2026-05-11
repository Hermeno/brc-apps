import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id }, include: { review: true } });

  if (!lead || lead.clientId !== user.id)
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  if (lead.status !== 'COMPLETED')
    return NextResponse.json({ error: 'Pedido ainda não foi concluído' }, { status: 409 });

  if (!lead.cleanerId)
    return NextResponse.json({ error: 'Nenhum profissional para avaliar' }, { status: 409 });

  if (lead.review)
    return NextResponse.json({ error: 'Avaliação já enviada' }, { status: 409 });

  const { rating, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5)
    return NextResponse.json({ error: 'Avaliação deve ser entre 1 e 5' }, { status: 400 });

  const review = await prisma.$transaction(async tx => {
    const r = await tx.review.create({
      data: { leadId: id, clientId: user.id, cleanerId: lead.cleanerId!, rating, comment: comment || null },
    });
    // Update cleaner stats
    const reviews = await tx.review.findMany({ where: { cleanerId: lead.cleanerId! }, select: { rating: true } });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await tx.cleanerStats.upsert({
      where: { cleanerId: lead.cleanerId! },
      create: { cleanerId: lead.cleanerId!, ratingAvg: avg },
      update: { ratingAvg: avg },
    });
    return r;
  });

  createNotification({
    userId: lead.cleanerId!,
    type:   'review_received',
    title:  'Nova avaliação recebida!',
    body:   `${rating} estrelas${comment ? ` — "${comment}"` : ''}`,
    link:   '/dashboard/cleaner',
  }).catch(() => {});

  return NextResponse.json({ review });
}
