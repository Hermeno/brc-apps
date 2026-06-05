import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// SSE stream — sends unread count every 5s
// Client connects once and receives live updates
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = user.id;
  let closed = false;

  let intervalId: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch {}
      };

      try {
        const count = await prisma.notification.count({ where: { userId, read: false } });
        send({ unreadCount: count });
      } catch { closed = true; return; }

      intervalId = setInterval(async () => {
        if (closed) { clearInterval(intervalId); return; }
        try {
          const [unreadCount, latest] = await Promise.all([
            prisma.notification.count({ where: { userId, read: false } }),
            prisma.notification.findFirst({
              where:   { userId, read: false },
              orderBy: { createdAt: 'desc' },
              select:  { id: true, title: true, body: true, type: true, link: true, createdAt: true },
            }),
          ]);
          send({ unreadCount, latest });
        } catch { clearInterval(intervalId); closed = true; }
      }, 30000);
    },
    cancel() { closed = true; clearInterval(intervalId); },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
