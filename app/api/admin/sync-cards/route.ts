import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncCardOnFile } from '@/lib/card-on-file';
import { NextResponse } from 'next/server';
import { logError, logInfo } from '@/lib/logger';

// Repairs card-on-file state for every cleaner with a Stripe customer.
//
// Cleaners whose setup webhook never landed have a card in Stripe but
// hasPaymentMethod=false, so matching skips them and no fee is ever auto-charged.
// Opening the payment-methods page fixes one account; this fixes them all at once.
export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const me = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { role: true },
    });
    if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const cleaners = await prisma.user.findMany({
      where:  { role: 'CLEANER', stripeCustomerId: { not: null }, deletedAt: null },
      select: { id: true, stripeCustomerId: true, hasPaymentMethod: true },
    });

    let repaired = 0;
    let withCard = 0;
    let failed   = 0;

    for (const cleaner of cleaners) {
      const { ok, cards } = await syncCardOnFile(cleaner.stripeCustomerId!);
      if (!ok) { failed++; continue; }

      const hasCard = cards.length > 0;
      if (hasCard) withCard++;
      if (hasCard !== cleaner.hasPaymentMethod) repaired++;
    }

    logInfo('[POST /api/admin/sync-cards]', 'Card state resynced', {
      checked: cleaners.length, repaired, withCard, failed,
    });

    return NextResponse.json({ checked: cleaners.length, repaired, withCard, failed });
  } catch (err) {
    logError('[POST /api/admin/sync-cards]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
