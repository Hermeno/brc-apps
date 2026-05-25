export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { prisma } = await import('./lib/prisma');
    // Add any columns that may not yet exist in the DB (safe, idempotent)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "serviceRadiusMiles" DOUBLE PRECISION DEFAULT 25
    `).catch(() => {
      // DB may be sleeping on startup (Neon free tier) — non-fatal, runs on next boot
    });

    // Migrate any legacy PREMIUM users → PRO (one-time, idempotent)
    await prisma.$executeRawUnsafe(`
      UPDATE "User" SET plan = 'PRO' WHERE plan = 'PREMIUM'
    `).catch(() => {});
  }
}
