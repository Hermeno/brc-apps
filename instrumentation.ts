export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { prisma } = await import('./lib/prisma');
    const { advanceWaves, runMatching } = await import('./lib/matching');

    // Wave advancement — mirrors the Vercel cron (/api/cron/waves) so it also
    // works when running in Docker (where Vercel's cron service doesn't reach).
    const { logError } = await import('./lib/logger');

    let wavesRunning = false;
    setInterval(async () => {
      if (wavesRunning) return;
      wavesRunning = true;
      try {
        const rematchIds = await advanceWaves();
        for (const id of rematchIds) {
          await runMatching(id).catch(err => logError('[waves] runMatching', err));
        }
      } catch (err) {
        logError('[waves] advanceWaves', err);
      } finally {
        wavesRunning = false;
      }
    }, 60_000);

    const run = (sql: string, ...params: unknown[]) =>
      params.length
        ? prisma.$executeRawUnsafe(sql, ...params).catch((e: unknown) => console.error('[boot sql]', e))
        : prisma.$executeRawUnsafe(sql).catch((e: unknown) => console.error('[boot sql]', e));

    const retry = async (fn: () => Promise<void>, attempts = 4, delayMs = 8_000) => {
      for (let i = 0; i < attempts; i++) {
        try { await fn(); return; } catch (e) {
          if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs));
          else console.error('[boot sql] giving up after', attempts, 'attempts:', e);
        }
      }
    };

    // Defer boot SQL by 12s so the connection pool settles before we run migrations/seeds
    setTimeout(async () => { await retry(async () => {
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
    }); }, 12_000);
  }
}
