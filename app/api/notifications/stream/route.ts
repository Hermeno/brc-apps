import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// SSE stream — pushes the unread count and the newest notification.
// Auto-closes after 10 minutes; the client's EventSource reconnects automatically.
// Queries run sequentially (not parallel) to avoid double-borrowing pool connections.
//
// The interval has to beat the wave window: a cleaner gets 90 seconds to claim a
// lead, so a 60s poll could burn two thirds of it before the bell even moved.
// The count is a single indexed lookup on (userId, read), and the notification
// body is only fetched when that count actually goes up.
const POLL_MS    = 5_000;
const MAX_AGE_MS = 10 * 60 * 1000;

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let user: { id: string } | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = user.id;
  let closed = false;
  let intervalId: ReturnType<typeof setInterval> | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (closed) return;
        try { controller.enqueue(`data: ${JSON.stringify(data)}\n\n`); } catch {}
      };

      let lastCount = -1;

      const poll = async () => {
        if (closed) return;
        try {
          const unreadCount = await prisma.notification.count({ where: { userId, read: false } });

          // Only read the notification itself when something new arrived —
          // otherwise this is one indexed count every few seconds.
          let latest = null;
          if (unreadCount > 0 && unreadCount !== lastCount) {
            latest = await prisma.notification.findFirst({
              where:   { userId, read: false },
              orderBy: { createdAt: 'desc' },
              select:  { id: true, title: true, body: true, type: true, link: true, createdAt: true },
            });
          }
          lastCount = unreadCount;

          send({ unreadCount, latest });
        } catch {
          cleanup();
        }
      };

      const cleanup = () => {
        closed = true;
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        try { controller.close(); } catch {}
      };

      await poll();
      if (closed) return;

      intervalId = setInterval(poll, POLL_MS);

      // Close stream after MAX_AGE_MS; EventSource reconnects automatically.
      timeoutId = setTimeout(cleanup, MAX_AGE_MS);
    },
    cancel() {
      closed = true;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache, no-transform',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
