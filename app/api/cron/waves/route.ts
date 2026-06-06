import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { advanceWaves, runMatching } from '@/lib/matching';

// Called by Vercel Cron every minute — advances Wave1→Wave2→Wave3 and cycles WAVE3 batches.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rematchIds = await advanceWaves();

    // Re-run matching for leads whose fee deadline expired — must use after() here
    // because advanceWaves() is library code and cannot call after() itself.
    if (rematchIds.length > 0) {
      after(() =>
        Promise.all(
          rematchIds.map(id => runMatching(id).catch(e => console.error('[fee-deadline rematch]', e))),
        ),
      );
    }

    return NextResponse.json({ ok: true, ts: new Date().toISOString(), rematchIds });
  } catch (err: any) {
    console.error('[cron/waves]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
