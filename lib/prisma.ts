import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function buildUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[prisma] DATABASE_URL is not set — all DB calls will fail');
    return undefined;
  }

  // Append Prisma connection params via string manipulation instead of new URL()
  // to avoid the URL API corrupting passwords that contain special characters
  // (e.g. '@', '!', '#') by misinterpreting them as URL delimiters.
  // Keep per-instance pool small so multiple DO instances don't exhaust Neon's
  // ~20-connection free-tier limit; with 3 per instance we support up to 6 instances.
  const append = (base: string, key: string, val: string) =>
    base.includes(`${key}=`) ? base : `${base}${base.includes('?') ? '&' : '?'}${key}=${val}`;

  let out = url;
  out = append(out, 'connect_timeout',  '15');
  out = append(out, 'pool_timeout',     '30');
  out = append(out, 'connection_limit', '3');
  return out;
}

function createClient() {
  const url = buildUrl();
  const client = new PrismaClient({
    log: [{ emit: 'event', level: 'error' }],
    ...(url ? { datasources: { db: { url } } } : {}),
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
