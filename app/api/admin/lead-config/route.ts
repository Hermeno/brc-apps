import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  return me?.role === 'ADMIN' ? me : null;
}

const PRICE_DEFAULTS = [
  { id: 'standard',  price: 10 },
  { id: 'deep',      price: 20 },
  { id: 'post-work', price: 32 },
  { id: 'moving',    price: 32 },
];

const PLATFORM_DEFAULTS = [
  { id: 'same_day_multiplier',  value: '1.5' },
  { id: 'recurring_multiplier', value: '1.3' },
  { id: 'coverage_zips',        value: '[]'  },
];

async function ensureTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LeadPriceConfig" (
      "id"        TEXT             NOT NULL,
      "price"     DOUBLE PRECISION NOT NULL,
      "updatedAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LeadPriceConfig_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LeadPlatformConfig" (
      "id"        TEXT         NOT NULL,
      "value"     TEXT         NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LeadPlatformConfig_pkey" PRIMARY KEY ("id")
    )
  `);

  for (const d of PRICE_DEFAULTS) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "LeadPriceConfig" ("id", "price", "updatedAt")
       VALUES ($1, $2, NOW()) ON CONFLICT ("id") DO NOTHING`,
      d.id, d.price,
    );
  }
  for (const d of PLATFORM_DEFAULTS) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "LeadPlatformConfig" ("id", "value", "updatedAt")
       VALUES ($1, $2, NOW()) ON CONFLICT ("id") DO NOTHING`,
      d.id, d.value,
    );
  }
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await ensureTables();

    const [prices, platform] = await Promise.all([
      prisma.$queryRaw<{ id: string; price: number; updatedAt: Date }[]>`
        SELECT id, price, "updatedAt" FROM "LeadPriceConfig" ORDER BY id
      `,
      prisma.$queryRaw<{ id: string; value: string; updatedAt: Date }[]>`
        SELECT id, value, "updatedAt" FROM "LeadPlatformConfig" ORDER BY id
      `,
    ]);

    return NextResponse.json({ prices, platform });
  } catch (err: any) {
    logError('[GET /api/admin/lead-config]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();

    if (body.type === 'price') {
      const { id, price } = body;
      if (!['standard', 'deep', 'post-work', 'moving'].includes(id)) {
        return NextResponse.json({ error: 'Invalid service type' }, { status: 400 });
      }
      if (typeof price !== 'number' || price < 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
      }
      await ensureTables();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "LeadPriceConfig" ("id", "price", "updatedAt")
         VALUES ($1, $2, NOW())
         ON CONFLICT ("id") DO UPDATE SET "price" = $2, "updatedAt" = NOW()`,
        id, price,
      );
      return NextResponse.json({ ok: true });
    }

    if (body.type === 'platform') {
      const { id, value } = body;
      const allowed = ['same_day_multiplier', 'recurring_multiplier', 'coverage_zips'];
      if (!allowed.includes(id)) {
        return NextResponse.json({ error: 'Invalid config key' }, { status: 400 });
      }
      if (id !== 'coverage_zips') {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
          return NextResponse.json({ error: 'Multiplier must be a positive number' }, { status: 400 });
        }
      }
      await ensureTables();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "LeadPlatformConfig" ("id", "value", "updatedAt")
         VALUES ($1, $2, NOW())
         ON CONFLICT ("id") DO UPDATE SET "value" = $2, "updatedAt" = NOW()`,
        id, String(value),
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (err: any) {
    logError('[PATCH /api/admin/lead-config]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
