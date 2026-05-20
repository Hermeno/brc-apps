import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { runMatching } from '@/lib/matching';

const EDITABLE_STATUSES = ['NEW', 'WAVE1', 'WAVE2', 'WAVE3', 'UNMATCHED'];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead || lead.clientId !== user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!EDITABLE_STATUSES.includes(lead.status))
    return NextResponse.json({ error: 'Booking cannot be edited in its current state' }, { status: 409 });

  const body = await req.json();
  const { serviceType, address, dateTime, notes, bedrooms, bathrooms, squareMeters, extras, frequency,
    estimatedMinPrice, estimatedMaxPrice, estimatedHours } = body;

  const parsedDate = dateTime ? new Date(dateTime) : lead.dateTime;
  if (isNaN(parsedDate.getTime())) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      ...(serviceType      && { serviceType }),
      ...(address          && { address }),
      dateTime: parsedDate,
      notes: notes ?? lead.notes,
      ...(bedrooms    !== undefined && { bedrooms }),
      ...(bathrooms   !== undefined && { bathrooms }),
      ...(squareMeters !== undefined && { squareMeters }),
      ...(extras       !== undefined && { extras }),
      ...(frequency    !== undefined && { frequency }),
      ...(estimatedMinPrice !== undefined && { estimatedMinPrice }),
      ...(estimatedMaxPrice !== undefined && { estimatedMaxPrice }),
      ...(estimatedHours    !== undefined && { estimatedHours }),
      status: 'NEW',
    },
  });

  // Delete old distributions and re-run matching
  await prisma.leadDistribution.deleteMany({ where: { leadId: id } });
  runMatching(id).catch(e => console.error('[re-match]', e));

  return NextResponse.json({ lead: updated });
}
