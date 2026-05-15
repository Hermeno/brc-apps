import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function requireAdmin(email: string) {
  const me = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  return me?.role === 'ADMIN';
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await requireAdmin(session.user.email))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { action, name, email, phone, address, suspendDays } = body;

  if (action === 'suspend') {
    const until = new Date();
    until.setDate(until.getDate() + (suspendDays ?? 7));
    const user = await prisma.user.update({ where: { id }, data: { suspendedUntil: until } });
    return NextResponse.json({ user });
  }

  if (action === 'unsuspend') {
    const user = await prisma.user.update({ where: { id }, data: { suspendedUntil: null } });
    return NextResponse.json({ user });
  }

  // Generic update
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name    !== undefined && { name }),
      ...(email   !== undefined && { email }),
      ...(phone   !== undefined && { phone }),
      ...(address !== undefined && { address }),
    },
  });
  return NextResponse.json({ user });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await requireAdmin(session.user.email))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  // Cascade-delete related records before deleting user
  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { userId: id } }),
    prisma.workPhoto.deleteMany({ where: { cleanerId: id } }),
    prisma.cleanerVerification.deleteMany({ where: { cleanerId: id } }),
    prisma.cleanerStats.deleteMany({ where: { cleanerId: id } }),
    prisma.verificationToken.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
