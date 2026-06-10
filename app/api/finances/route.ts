import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const [conversations, completedLeads, stats] = await Promise.all([
      prisma.conversation.findMany({
        where: { cleanerId: user.id, feeStatus: 'charged' },
        include: {
          lead: {
            select: {
              serviceType: true, dateTime: true, address: true,
              estimatedMinPrice: true, estimatedMaxPrice: true, status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.findMany({
        where: { cleanerId: user.id, status: 'COMPLETED' },
        select: { estimatedMinPrice: true, estimatedMaxPrice: true, dateTime: true, serviceType: true },
      }),
      prisma.cleanerStats.findUnique({
        where: { cleanerId: user.id },
        select: { ratingAvg: true, totalLeads: true },
      }),
    ]);

    const totalFeesPaid = conversations.reduce((sum, c) => sum + (c.leadFee ?? 0), 0);
    const totalJobsCompleted = completedLeads.length;
    const estimatedEarnings = completedLeads.reduce(
      (sum, l) => sum + ((l.estimatedMinPrice ?? 0) + (l.estimatedMaxPrice ?? 0)) / 2,
      0,
    );

    return NextResponse.json({
      transactions: conversations,
      totalFeesPaid,
      totalJobsCompleted,
      estimatedEarnings: Math.round(estimatedEarnings),
      ratingAvg: stats?.ratingAvg ?? 0,
    });
  } catch (err: any) {
    logError('[finances]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
