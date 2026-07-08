import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { REFERRAL_QUALIFY_COUNT, getReferralLink } from '@/lib/referrals';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true, role: true, referralQualifiedCount: true, freeLeadCredits: true,
        referrals: {
          select: { id: true, name: true, isVerified: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user || user.role !== 'CLEANER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      link: getReferralLink(user.id),
      qualifyCount: REFERRAL_QUALIFY_COUNT,
      referralQualifiedCount: user.referralQualifiedCount,
      progressInCycle: user.referralQualifiedCount % REFERRAL_QUALIFY_COUNT,
      freeLeadCredits: user.freeLeadCredits,
      referrals: user.referrals,
    });
  } catch (err: any) {
    logError('[GET /api/referrals]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
