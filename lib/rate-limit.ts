import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logWarn } from '@/lib/logger';

// Fixed-window rate limiting, backed by the database.
//
// It lives in Postgres rather than in memory because the app ships as a container
// that gets restarted on every deploy: an in-memory counter would reset each time
// and would not be shared if the service were ever scaled past one instance.
// Auth endpoints see little traffic, so one upsert per attempt costs nothing.

export type RateLimitRule = {
  limit:         number;  // attempts allowed per window
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed:    boolean;
  retryAfter: number;  // seconds until the window rolls over; 0 when allowed
};

// ─── Identifying the caller ───────────────────────────────────────────────────
// Behind DigitalOcean's router the socket address is the proxy, so the real
// client only appears in x-forwarded-for. We take the first entry, which is the
// one the edge appended. A caller can spoof this header, so it is a throttle on
// honest traffic and casual scripts, not an access control.
export function callerIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

// ─── Core check ───────────────────────────────────────────────────────────────
// One statement does the whole job: insert the row, or bump it — resetting the
// counter when the stored window has already elapsed. Doing it in SQL keeps two
// simultaneous requests from both reading "0" and both being let through.
export async function checkRateLimit(
  bucket: string,
  identifier: string,
  rule: RateLimitRule,
): Promise<RateLimitResult> {
  const key = `${bucket}|${identifier}`;

  try {
    const rows = await prisma.$queryRawUnsafe<{ count: number; window_age: number }[]>(
      `INSERT INTO "RateLimit" ("key", "count", "windowStart")
       VALUES ($1, 1, NOW())
       ON CONFLICT ("key") DO UPDATE SET
         "count" = CASE
           WHEN "RateLimit"."windowStart" < NOW() - make_interval(secs => $2::int)
           THEN 1
           ELSE "RateLimit"."count" + 1
         END,
         "windowStart" = CASE
           WHEN "RateLimit"."windowStart" < NOW() - make_interval(secs => $2::int)
           THEN NOW()
           ELSE "RateLimit"."windowStart"
         END
       RETURNING "count", EXTRACT(EPOCH FROM NOW() - "windowStart")::int AS window_age`,
      key,
      rule.windowSeconds,
    );

    const row = rows[0];
    if (!row) return { allowed: true, retryAfter: 0 };

    if (row.count > rule.limit) {
      return { allowed: false, retryAfter: Math.max(1, rule.windowSeconds - row.window_age) };
    }
    return { allowed: true, retryAfter: 0 };
  } catch (err) {
    // Fail open. Every endpoint this guards needs the database anyway, so a
    // failure here means the request was going to fail regardless — locking
    // everyone out on top of that would only widen the outage.
    logWarn('[rate-limit]', `check failed for ${bucket}; allowing request`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return { allowed: true, retryAfter: 0 };
  }
}

// ─── Route helper ─────────────────────────────────────────────────────────────
// Returns the 429 to send back, or null when the caller may proceed, so a route
// guards itself in one line:
//
//   const limited = await enforceRateLimit(req, 'auth:login', AUTH_LIMITS.login);
//   if (limited) return limited;
export async function enforceRateLimit(
  req: NextRequest,
  bucket: string,
  rule: RateLimitRule,
  identifier = callerIp(req),
): Promise<NextResponse | null> {
  const { allowed, retryAfter } = await checkRateLimit(bucket, identifier, rule);
  if (allowed) return null;

  return NextResponse.json(
    { error: 'Too many attempts. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

// ─── Limits ───────────────────────────────────────────────────────────────────
// Deliberately generous: these exist to stop password guessing and mail
// flooding, not to inconvenience someone who mistyped twice.
export const AUTH_LIMITS = {
  register:     { limit: 5,  windowSeconds: 60 * 60 },  // 5 accounts per hour per IP
  login:        { limit: 10, windowSeconds: 15 * 60 },
  passwordWrite:{ limit: 5,  windowSeconds: 15 * 60 },  // forgot + reset
  emailResend:  { limit: 3,  windowSeconds: 15 * 60 },  // each one sends mail
  setupAdmin:   { limit: 5,  windowSeconds: 60 * 60 },  // guards the shared secret
} satisfies Record<string, RateLimitRule>;
