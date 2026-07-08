import { prisma } from './prisma';
import { createNotification } from './notifications';

// Refer this many verified cleaners to earn one free lead credit.
export const REFERRAL_QUALIFY_COUNT = 3;

// Behind the DO App Platform proxy, req.nextUrl.origin resolves to the
// container's internal bind address (0.0.0.0:3000), not the public domain —
// so the referral link must use a fixed site URL instead of the request origin.
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://verliks.com';

export function getReferralLink(cleanerId: string): string {
  return `${SITE_URL}/auth/register?ref=${cleanerId}`;
}

// Call once, right after a cleaner's verification flips PENDING/REJECTED → APPROVED.
// Bumps the referrer's qualified count and grants a free-lead credit every Nth referral.
export async function creditReferralIfQualified(newlyVerifiedCleanerId: string): Promise<void> {
  const cleaner = await prisma.user.findUnique({
    where: { id: newlyVerifiedCleanerId },
    select: { referredById: true },
  });
  if (!cleaner?.referredById) return;

  const referrer = await prisma.user.update({
    where: { id: cleaner.referredById },
    data: { referralQualifiedCount: { increment: 1 } },
    select: { id: true, referralQualifiedCount: true },
  });

  if (referrer.referralQualifiedCount % REFERRAL_QUALIFY_COUNT !== 0) return;

  await prisma.user.update({
    where: { id: referrer.id },
    data: { freeLeadCredits: { increment: 1 } },
  });

  createNotification({
    userId: referrer.id,
    type: 'referral_credit_earned',
    title: 'You earned a free lead!',
    body: `${REFERRAL_QUALIFY_COUNT} of your referrals are now verified cleaners — a free lead credit was added to your account.`,
    link: '/dashboard/referrals',
  }).catch(() => {});
}
