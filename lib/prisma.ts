import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function loadCACert(): string | undefined {
  try {
    return readFileSync(join(process.cwd(), 'ca', 'ca-certificate.crt')).toString();
  } catch {
    return undefined;
  }
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[prisma] DATABASE_URL is not set — all DB calls will fail');
  }

  const ca = loadCACert();

  const adapter = new PrismaPg({
    connectionString:        connectionString ?? '',
    max:                     3,
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis:       30_000,
    ssl:                     ca ? { rejectUnauthorized: true, ca } : { rejectUnauthorized: false },
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
