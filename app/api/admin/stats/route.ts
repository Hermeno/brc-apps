import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (me?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [
    totalClients,
    totalCleaners,
    verifiedCleaners,
    pendingVerifications,
    leadByStatus,
    reviewAgg,
    recentLeads,
    topCleaners,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.user.count({ where: { role: 'CLEANER' } }),
    prisma.user.count({ where: { role: 'CLEANER', isVerified: true } }),
    prisma.cleanerVerification.count({ where: { status: 'PENDING' } }),
    prisma.lead.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.review.aggregate({ _avg: { rating: true }, _count: { id: true } }),
    prisma.lead.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, serviceType: true, status: true, createdAt: true,
        client: { select: { name: true } },
        cleaner: { select: { name: true } },
      },
    }),
    prisma.cleanerStats.findMany({
      take: 5,
      orderBy: { ratingAvg: 'desc' },
      where: { ratingAvg: { gt: 0 } },
      include: { cleaner: { select: { name: true, email: true, isVerified: true } } },
    }),
  ]);

  const byStatus: Record<string, number> = {};
  for (const row of leadByStatus) byStatus[row.status] = row._count.id;

  return NextResponse.json({
    users:         { totalClients, totalCleaners, verifiedCleaners, total: totalClients + totalCleaners },
    leads:         byStatus,
    verifications: { pending: pendingVerifications },
    reviews:       { total: reviewAgg._count.id, avgRating: reviewAgg._avg.rating ?? 0 },
    recentLeads,
    topCleaners,
  });
}
