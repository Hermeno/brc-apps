import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { runMatching } from '@/lib/matching';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    where: { clientId: dbUser.id },
    include: {
      cleaner: { select: { name: true, email: true } },
      conversations: {
        where: { status: { in: ['active', 'declined'] } },
        select: { id: true, cleanerId: true, status: true, cleaner: { select: { id: true, name: true, avatarUrl: true } } },
      },
      review: { select: { rating: true, comment: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ leads });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    serviceType, address, notes, dateTime,
    bedrooms, bathrooms, squareMeters, extras, frequency,
    estimatedMinPrice, estimatedMaxPrice, estimatedHours,
    photos,
  } = body;

  if (!serviceType || !address || !dateTime) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  // Resolve user ID from DB using email (reliable regardless of JWT version)
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
  }

  const parsedDate = new Date(dateTime);
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: 'Data/hora inválida' }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        clientId: dbUser.id,
        serviceType,
        address,
        notes:            notes || null,
        dateTime:         parsedDate,
        latitude:         0,
        longitude:        0,
        status:           'NEW',
        bedrooms:         bedrooms    ?? 1,
        bathrooms:        bathrooms   ?? 1,
        squareMeters:     squareMeters ?? 0,
        extras:           Array.isArray(extras) ? extras : [],
        frequency:        frequency   ?? 'once',
        photos:           Array.isArray(photos) ? photos.filter(Boolean).slice(0, 4) : [],
        estimatedMinPrice: estimatedMinPrice ?? null,
        estimatedMaxPrice: estimatedMaxPrice ?? null,
        estimatedHours:    estimatedHours    ?? null,
      },
    });

    // Trigger matching asynchronously (fire-and-forget)
    runMatching(lead.id).catch(e => console.error('[matching]', e));

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/leads] Prisma error:', err);
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 });
  }
}
