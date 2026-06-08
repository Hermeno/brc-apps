export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { prisma } = await import('./lib/prisma');

    const run = (sql: string, ...params: unknown[]) =>
      params.length
        ? prisma.$executeRawUnsafe(sql, ...params).catch(() => {})
        : prisma.$executeRawUnsafe(sql).catch(() => {});

    // Add any columns that may not yet exist in the DB (safe, idempotent)
    await run(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "serviceRadiusMiles" DOUBLE PRECISION DEFAULT 25`);

    // Migrate any legacy PREMIUM users → PRO (one-time, idempotent)
    await run(`UPDATE "User" SET plan = 'PRO' WHERE plan = 'PREMIUM'`);

    // Create config tables (managed outside Prisma schema — idempotent)
    await run(`
      CREATE TABLE IF NOT EXISTS "LeadPriceConfig" (
        "id"        TEXT             NOT NULL,
        "price"     DOUBLE PRECISION NOT NULL,
        "updatedAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LeadPriceConfig_pkey" PRIMARY KEY ("id")
      )
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS "LeadPlatformConfig" (
        "id"        TEXT         NOT NULL,
        "value"     TEXT         NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LeadPlatformConfig_pkey" PRIMARY KEY ("id")
      )
    `);

    // Seed defaults (ON CONFLICT DO NOTHING = safe to run every boot)
    const priceDefaults = [
      ['standard',  10],
      ['deep',      20],
      ['post-work', 32],
      ['moving',    32],
    ] as const;
    for (const [id, price] of priceDefaults) {
      await run(
        `INSERT INTO "LeadPriceConfig" ("id","price","updatedAt") VALUES ($1,$2,NOW()) ON CONFLICT ("id") DO NOTHING`,
        id, price,
      );
    }

    const platformDefaults = [
      ['same_day_multiplier',  '1.5'],
      ['recurring_multiplier', '1.3'],
      ['coverage_zips',        '[]' ],
    ] as const;
    for (const [id, value] of platformDefaults) {
      await run(
        `INSERT INTO "LeadPlatformConfig" ("id","value","updatedAt") VALUES ($1,$2,NOW()) ON CONFLICT ("id") DO NOTHING`,
        id, value,
      );
    }
  }
}
