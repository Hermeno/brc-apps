import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/pricing';
import { NextResponse } from 'next/server';

// Build defaults from the single source of truth in lib/pricing.ts
const PAID_PLANS = PLANS.filter(p => p.price > 0);

export async function GET() {
  try {
    // Auto-seed rows that don't exist yet
    for (const plan of PAID_PLANS) {
      await prisma.planConfig.upsert({
        where:  { id: plan.id },
        create: { id: plan.id, price: plan.price },
        update: {},  // never overwrite an admin-set price
      });
    }

    const configs = await prisma.planConfig.findMany();
    const result = PAID_PLANS.map(p => {
      const db = configs.find(c => c.id === p.id);
      return { id: p.id, price: db?.price ?? p.price };
    });
    return NextResponse.json(result);
  } catch {
    // DB unreachable — return defaults from lib/pricing.ts
    return NextResponse.json(PAID_PLANS.map(p => ({ id: p.id, price: p.price })));
  }
}
