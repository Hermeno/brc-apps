import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// SSE stream — sends unread count every 60s.
// Auto-closes after 10 minutes; the client's EventSource reconnects automatically.
// Queries run sequentially (not parallel) to avoid double-borrowing pool connections.
const POLL_MS    = 60_000;
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

      const poll = async () => {
        if (closed) return;
        try {
          const unreadCount = await prisma.notification.count({ where: { userId, read: false } });
          const latest = await prisma.notification.findFirst({
            where:   { userId, read: false },
            orderBy: { createdAt: 'desc' },
            select:  { id: true, title: true, body: true, type: true, link: true, createdAt: true },
          });
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
