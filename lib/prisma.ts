import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[prisma] DATABASE_URL is not set — all DB calls will fail');
  }

  // PrismaPg accepts a PoolConfig directly — no need for a separate Pool instance.
  // Keep max connections small so multiple DO instances don't exhaust the DB limit
  // (3 per instance supports up to ~6 simultaneous instances on a 20-connection DB).
  const adapter = new PrismaPg({
    connectionString:        connectionString ?? '',
    max:                     3,
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis:       30_000,
  });

  const client = new PrismaClient({
    adapter,
    log: [{ emit: 'event', level: 'error' }],
  });

  client.$on('error', (e) => {
    if (e.message.includes('Error in PostgreSQL connection')) return;
    const target = e.target ? ` ${e.target}` : '';
    console.error(`[prisma]${target}: ${e.message}`);
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createClient();
globalForPrisma.prisma = prisma;
