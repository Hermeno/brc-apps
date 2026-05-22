import { NextRequest, NextResponse } from 'next/server';
import { advanceWaves } from '@/lib/matching';

// Called by Vercel Cron every minute — advances Wave1→Wave2 and Wave2→UNMATCHED
export async function GET(req: NextRequest) {
  // Validate Vercel cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await advanceWaves();
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (err: any) {
    console.error('[cron/waves]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
