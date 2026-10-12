import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { advanceWaves, runMatching } from '@/lib/matching';
import { logError } from '@/lib/logger';

// Advances Wave1→Wave2→Wave3 and cycles WAVE3 batches. Meant to be called once a
// minute by whatever scheduler fronts the deployment.
//
// This is the only caller of advanceWaves() in the codebase, so if the schedule
// is not wired up, leads silently stop progressing and fee deadlines never
// expire. The schedule lives in vercel.json, which only takes effect on Vercel —
// a container deployment needs its own scheduled job pointing here.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  // Fail closed. A missing secret used to skip the check entirely, which left the
  // matching engine open to anyone who knew the path.
  if (!cronSecret) {
    logError('[cron/waves]', new Error('CRON_SECRET is not set; refusing to run'));
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rematchIds = await advanceWaves();

    // Re-run matching for leads whose fee deadline expired — must use after() here
    // because advanceWaves() is library code and cannot call after() itself.
    if (rematchIds.length > 0) {
      after(() =>
        Promise.all(
          rematchIds.map(id => runMatching(id).catch(e => logError('[fee-deadline rematch]', e))),
        ),
      );
    }

    return NextResponse.json({ ok: true, ts: new Date().toISOString(), rematchIds });
  } catch (err: any) {
    logError('[cron/waves]', err);
    // Generic message: the caller is a scheduler, and err.message can carry
    // connection strings and query fragments. Same shape as every other route.
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
