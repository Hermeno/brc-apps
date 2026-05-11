import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/notifications — list latest 30, unread first
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take:    40,
    }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications — mark all as read
export async function PATCH() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data:  { read: true },
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/notifications — clear all
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.notification.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
