import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function buildUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (!u.searchParams.has('connect_timeout'))  u.searchParams.set('connect_timeout', '30');
    if (!u.searchParams.has('pool_timeout'))     u.searchParams.set('pool_timeout',    '20');
    if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '10');
    return u.toString();
  } catch {
    return url;
  }
}

function createClient() {
  const client = new PrismaClient({
    log: [{ emit: 'event', level: 'error' }],
    datasources: { db: { url: buildUrl() } },
  });

  // Neon free-tier closes idle connections automatically — this is expected.
  // Prisma reconnects on the next query; suppress the noise.
  client.$on('error', (e) => {
    if (e.message.includes('Error in PostgreSQL connection')) return;
    const target = e.target ? ` ${e.target}` : '';
    console.error(`[prisma]${target}: ${e.message}`);
  });

  return client;
}

export const prisma = globalForPrisma.prisma || createClient();

globalForPrisma.prisma = prisma;
