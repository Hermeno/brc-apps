import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDayBuckets(daysBack: number): Record<string, number> {
  const buckets: Record<string, number> = {};
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets[toDateKey(d)] = 0;
  }
  return buckets;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (me?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalClients,
      totalCleaners,
      verifiedCleaners,
      pendingVerifications,
      leadByStatus,
      reviewAgg,
      recentLeads,
      topCleaners,
      leadsLast30,
      revenueConvs,
      totalRevenue,
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
      prisma.lead.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.conversation.findMany({
        where: { createdAt: { gte: thirtyDaysAgo }, feeStatus: 'charged' },
        select: { createdAt: true, leadFee: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.conversation.aggregate({
        where: { feeStatus: 'charged' },
        _sum: { leadFee: true },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const row of leadByStatus) byStatus[row.status] = row._count.id;

    const leadBuckets  = buildDayBuckets(30);
    const revBuckets   = buildDayBuckets(30);

    for (const l of leadsLast30) {
      const key = toDateKey(new Date(l.createdAt));
      if (key in leadBuckets) leadBuckets[key]++;
    }
    for (const c of revenueConvs) {
      const key = toDateKey(new Date(c.createdAt));
      if (key in revBuckets) revBuckets[key] = (revBuckets[key] ?? 0) + (c.leadFee ?? 0);
    }

    const leadsTimeSeries   = Object.entries(leadBuckets).map(([date, count])   => ({ date, count }));
    const revenueTimeSeries = Object.entries(revBuckets).map(([date, revenue]) => ({ date, revenue }));

    return NextResponse.json({
      users:         { totalClients, totalCleaners, verifiedCleaners, total: totalClients + totalCleaners },
      leads:         byStatus,
      verifications: { pending: pendingVerifications },
      reviews:       { total: reviewAgg._count.id, avgRating: reviewAgg._avg.rating ?? 0 },
      recentLeads,
      topCleaners,
      leadsTimeSeries,
      revenueTimeSeries,
      totalRevenue:  totalRevenue._sum.leadFee ?? 0,
    });
  } catch (err: any) {
    logError('[GET /api/admin/stats]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
