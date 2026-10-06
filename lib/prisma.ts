import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
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
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error('[prisma] DATABASE_URL is not set — all DB calls will fail');
  }

  const ca = loadCACert();

  // Strip sslmode from URL so pg-connection-string doesn't override our ssl config.
  // pg treats sslmode=require as verify-full (rejectUnauthorized: true), which breaks
  // connections to DO managed databases that use an internal CA.
  const connectionString = (rawUrl ?? '').replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '').replace(/\?$/, '');

  // Create Pool directly so ssl config is guaranteed — PrismaPg(PoolConfig) may strip
  // options other than connectionString when building the pool internally.
  const pool = new Pool({
    connectionString,
    max:                          3,
    connectionTimeoutMillis:      15_000,
    // Was 10s, which closed every idle connection between cron ticks. The wave
    // cron runs once a minute, so each run had to open a fresh TLS connection
    // to a database in another region, and those handshakes were what timed
    // out. Holding connections for 5 minutes lets the cron reuse a warm one.
    idleTimeoutMillis:            300_000,
    keepAlive:                    true,
    keepAliveInitialDelayMillis:  10_000,
    ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);

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
