import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function buildUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  // Neon free-tier drops idle connections after ~5 min.
  // Appending pool params keeps connections fresh and retries faster.
  try {
    const u = new URL(url);
    if (!u.searchParams.has('connect_timeout'))  u.searchParams.set('connect_timeout', '30');
    if (!u.searchParams.has('pool_timeout'))     u.searchParams.set('pool_timeout',    '10');
    if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '5');
    return u.toString();
  } catch {
    return url;
  }
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
    datasources: { db: { url: buildUrl() } },
  });

// Cache instance in all environments to avoid exhausting connection pool
globalForPrisma.prisma = prisma;
