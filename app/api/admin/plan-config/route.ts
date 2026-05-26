import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  return me?.role === 'ADMIN' ? me : null;
}

const DEFAULTS = [
  { id: 'BASIC', price: 39 },
  { id: 'PRO',   price: 79 },
];

// Create table + seed rows if they don't exist yet
async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PlanConfig" (
      "id"        TEXT             NOT NULL,
      "price"     DOUBLE PRECISION NOT NULL,
      "updatedAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PlanConfig_pkey" PRIMARY KEY ("id")
    )
  `);

  for (const d of DEFAULTS) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "PlanConfig" ("id", "price", "updatedAt")
       VALUES ($1, $2, NOW())
       ON CONFLICT ("id") DO NOTHING`,
      d.id, d.price,
    );
  }
}

// GET — return all plan prices
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureTable();
  const configs = await prisma.planConfig.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(configs);
}

// PATCH — update a plan price: { id: 'BASIC', price: 35 }
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, price } = await req.json();
  if (!['BASIC', 'PRO'].includes(id)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }
  if (typeof price !== 'number' || price < 1) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  await ensureTable();
  const config = await prisma.planConfig.upsert({
    where:  { id },
    create: { id, price },
    update: { price },
  });
  return NextResponse.json(config);
}
