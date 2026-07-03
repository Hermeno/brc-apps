import { prisma } from '@/lib/prisma';

export async function isPlanActive(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { plan: true, subscriptionEndsAt: true },
  });
  if (!user) return false;
  if (user.plan === 'FREE') return true; // FREE never expires
  if (!user.subscriptionEndsAt) return true; // no end date set yet = still active
  return user.subscriptionEndsAt > new Date();
}

export async function enforcePlan(userId: string) {
  const active = await isPlanActive(userId);
  if (!active) {
    await prisma.user.update({
      where: { id: userId },
      data:  { plan: 'FREE', stripeSubscriptionId: null },
    });
  }
  return active;
}
