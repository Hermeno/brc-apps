import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (me?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? undefined;
    const search = searchParams.get('search') ?? '';
    const take   = Math.min(parseInt(searchParams.get('take') ?? '50'), 100);
    const skip   = parseInt(searchParams.get('skip') ?? '0');

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { client:  { name:  { contains: search, mode: 'insensitive' } } },
        { client:  { email: { contains: search, mode: 'insensitive' } } },
        { cleaner: { name:  { contains: search, mode: 'insensitive' } } },
        { address: { contains: search, mode: 'insensitive' } },
        { serviceType: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          client:  { select: { id: true, name: true, email: true, phone: true } },
          cleaner: { select: { id: true, name: true, email: true, isVerified: true } },
          conversations: {
            select: {
              id: true, status: true, feeStatus: true, leadFee: true,
              cleaner: { select: { id: true, name: true } },
            },
          },
          review: { select: { rating: true, comment: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({ leads, total });
  } catch (err: any) {
    console.error('[GET /api/admin/leads]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
