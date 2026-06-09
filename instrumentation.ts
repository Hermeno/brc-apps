export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { prisma } = await import('./lib/prisma');
    const { advanceWaves, runMatching } = await import('./lib/matching');

    // Wave advancement — mirrors the Vercel cron (/api/cron/waves) so it also
    // works when running in Docker (where Vercel's cron service doesn't reach).
    setInterval(async () => {
      try {
        const rematchIds = await advanceWaves();
        await Promise.all(rematchIds.map(id => runMatching(id).catch(err => console.error('[waves] runMatching error:', err))));
      } catch (err) {
        console.error('[waves] advanceWaves error:', err);
      }
    }, 60_000);

    const run = (sql: string, ...params: unknown[]) =>
      params.length
        ? prisma.$executeRawUnsafe(sql, ...params).catch((e: unknown) => console.error('[boot sql]', e))
        : prisma.$executeRawUnsafe(sql).catch((e: unknown) => console.error('[boot sql]', e));

    // Add serviceRadiusMiles if not yet in DB (idempotent — Prisma schema also declares it)
    await run(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "serviceRadiusMiles" DOUBLE PRECISION DEFAULT 25`);

    // Migrate any legacy PREMIUM users → PRO (one-time, idempotent)
    await run(`UPDATE "User" SET plan = 'PRO' WHERE plan = 'PREMIUM'`);

    // Seed LeadPriceConfig defaults (upsert = safe to run every boot)
    const priceDefaults: [string, number][] = [
      ['standard',  10],
      ['deep',      20],
      ['post-work', 32],
      ['moving',    32],
    ];
    for (const [id, price] of priceDefaults) {
      await prisma.leadPriceConfig.upsert({
        where:  { id },
        create: { id, price },
        update: {},
      }).catch(() => {});
    }

    // Seed LeadPlatformConfig defaults
    const platformDefaults: [string, string][] = [
      ['same_day_multiplier',  '1.5'],
      ['recurring_multiplier', '1.3'],
      ['coverage_zips',        '[]' ],
    ];
    for (const [id, value] of platformDefaults) {
      await prisma.leadPlatformConfig.upsert({
        where:  { id },
        create: { id, value },
        update: {},
      }).catch(() => {});
    }
  }
}
