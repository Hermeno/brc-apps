import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { REFERRAL_QUALIFY_COUNT } from '@/lib/referrals';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (me?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const cleaners = await prisma.user.findMany({
      where: {
        role: 'CLEANER',
        OR: [
          { referrals: { some: {} } },
          { referralQualifiedCount: { gt: 0 } },
          { freeLeadCredits: { gt: 0 } },
        ],
      },
      select: {
        id: true, name: true, email: true, createdAt: true,
        referralQualifiedCount: true, freeLeadCredits: true,
        referrals: {
          select: { id: true, name: true, email: true, isVerified: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ referralQualifiedCount: 'desc' }, { createdAt: 'desc' }],
    });

    const rows = cleaners.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      createdAt: c.createdAt,
      totalReferred: c.referrals.length,
      totalVerified: c.referralQualifiedCount,
      freeLeadCredits: c.freeLeadCredits,
      creditsEarned: Math.floor(c.referralQualifiedCount / REFERRAL_QUALIFY_COUNT),
      referrals: c.referrals,
    }));

    const summary = {
      totalCleanersReferring: rows.length,
      totalReferred: rows.reduce((sum, r) => sum + r.totalReferred, 0),
      totalVerified: rows.reduce((sum, r) => sum + r.totalVerified, 0),
      totalCreditsEarned: rows.reduce((sum, r) => sum + r.creditsEarned, 0),
      totalCreditsOutstanding: rows.reduce((sum, r) => sum + r.freeLeadCredits, 0),
    };

    return NextResponse.json({ rows, summary, qualifyCount: REFERRAL_QUALIFY_COUNT });
  } catch (err: any) {
    logError('[GET /api/admin/referrals]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
