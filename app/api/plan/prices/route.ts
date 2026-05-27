import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/pricing';
import { NextResponse } from 'next/server';

const PAID_PLANS = PLANS.filter(p => p.price > 0);

async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PlanConfig" (
      "id"        TEXT             NOT NULL,
      "price"     DOUBLE PRECISION NOT NULL,
      "updatedAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PlanConfig_pkey" PRIMARY KEY ("id")
    )
  `);
  for (const p of PAID_PLANS) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "PlanConfig" ("id","price","updatedAt") VALUES ($1,$2,NOW()) ON CONFLICT ("id") DO NOTHING`,
      p.id, p.price,
    );
  }
}

export async function GET() {
  try {
    await ensureTable();
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
