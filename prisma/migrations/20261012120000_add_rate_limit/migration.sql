-- Backing table for lib/rate-limit.ts: one row per (bucket, caller) pair, holding
-- the attempt count and when the current window opened. Counters live here rather
-- than in memory so they survive the container restart that every deploy causes.
CREATE TABLE IF NOT EXISTS "RateLimit" (
    "key"         TEXT         NOT NULL,
    "count"       INTEGER      NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- Supports pruning rows whose window closed long ago.
CREATE INDEX IF NOT EXISTS "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");
