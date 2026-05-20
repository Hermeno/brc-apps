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

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await prisma.$transaction(async tx => {
    // 1. Delete messages inside conversations this user is part of
    const convIds = (await tx.conversation.findMany({
      where: { OR: [{ clientId: id }, { cleanerId: id }] },
      select: { id: true },
    })).map(c => c.id);

    if (convIds.length > 0) {
      await tx.message.deleteMany({ where: { conversationId: { in: convIds } } });
    }
    await tx.conversation.deleteMany({ where: { OR: [{ clientId: id }, { cleanerId: id }] } });

    if (target.role === 'CLIENT') {
      // 2a. Delete everything tied to leads this client created
      const leadIds = (await tx.lead.findMany({
        where: { clientId: id },
        select: { id: true },
      })).map(l => l.id);

      if (leadIds.length > 0) {
        await tx.leadDistribution.deleteMany({ where: { leadId: { in: leadIds } } });
        await tx.review.deleteMany({ where: { leadId: { in: leadIds } } });
        await tx.lead.deleteMany({ where: { clientId: id } });
      }
    } else {
      // 2b. Cleaner — detach from leads, delete their distributions and reviews
      await tx.lead.updateMany({ where: { cleanerId: id }, data: { cleanerId: null } });
      await tx.leadDistribution.deleteMany({ where: { cleanerId: id } });
      await tx.review.deleteMany({ where: { cleanerId: id } });
    }

    // 3. Delete profile-related records
    await tx.notification.deleteMany({ where: { userId: id } });
    await tx.workPhoto.deleteMany({ where: { cleanerId: id } });
    await tx.cleanerVerification.deleteMany({ where: { cleanerId: id } });
    await tx.cleanerStats.deleteMany({ where: { cleanerId: id } });
    await tx.verificationToken.deleteMany({ where: { userId: id } });

    // 4. Delete the user
    await tx.user.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true });
}
