import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/pricing';
import { NextRequest, NextResponse } from 'next/server';

const PAID_PLANS = PLANS.filter(p => p.price > 0);

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  return me?.role === 'ADMIN' ? me : null;
}

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
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await ensureTable();
    const configs = await prisma.planConfig.findMany({ orderBy: { id: 'asc' } });
    return NextResponse.json(configs);
  } catch (err: any) {
    console.error('[plan-config GET]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { id, price } = await req.json();
    const validIds = PAID_PLANS.map(p => p.id as string);
    if (!validIds.includes(id))
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    if (typeof price !== 'number' || price < 1)
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });

    await ensureTable();
    const config = await prisma.planConfig.upsert({
      where:  { id },
      create: { id, price },
      update: { price },
    });
    return NextResponse.json(config);
  } catch (err: any) {
    console.error('[plan-config PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
