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

  // Gather IDs needed for cascade deletes (parallel round trips)
  const [convRows, leadRows] = await Promise.all([
    prisma.conversation.findMany({
      where: { OR: [{ clientId: id }, { cleanerId: id }] },
      select: { id: true },
    }),
    target.role === 'CLIENT'
      ? prisma.lead.findMany({ where: { clientId: id }, select: { id: true } })
      : Promise.resolve([] as { id: string }[]),
  ]);

  const convIds = convRows.map(c => c.id);
  const leadIds = leadRows.map(l => l.id);

  await prisma.$transaction(async tx => {
    // Phase 1: delete all leaf-level records in parallel
    await Promise.all([
      // Messages in every conversation this user was part of
      convIds.length > 0
        ? tx.message.deleteMany({ where: { conversationId: { in: convIds } } })
        : Promise.resolve(),

      // Lead children
      target.role === 'CLIENT'
        ? leadIds.length > 0
          ? Promise.all([
              tx.leadDistribution.deleteMany({ where: { leadId: { in: leadIds } } }),
              tx.review.deleteMany({ where: { leadId: { in: leadIds } } }),
            ])
          : Promise.resolve()
        : Promise.all([
            tx.lead.updateMany({ where: { cleanerId: id }, data: { cleanerId: null } }),
            tx.leadDistribution.deleteMany({ where: { cleanerId: id } }),
            tx.review.deleteMany({ where: { cleanerId: id } }),
          ]),

      // Profile-level records (independent of each other)
      tx.notification.deleteMany({ where: { userId: id } }),
      tx.workPhoto.deleteMany({ where: { cleanerId: id } }),
      tx.cleanerVerification.deleteMany({ where: { cleanerId: id } }),
      tx.cleanerStats.deleteMany({ where: { cleanerId: id } }),
      tx.verificationToken.deleteMany({ where: { userId: id } }),
    ]);

    // Phase 2: delete parent records (conversations and leads, now that children are gone)
    await Promise.all([
      convIds.length > 0
        ? tx.conversation.deleteMany({ where: { OR: [{ clientId: id }, { cleanerId: id }] } })
        : Promise.resolve(),
      target.role === 'CLIENT' && leadIds.length > 0
        ? tx.lead.deleteMany({ where: { clientId: id } })
        : Promise.resolve(),
    ]);

    // Phase 3: delete the user
    await tx.user.delete({ where: { id } });
  }, { timeout: 30000 });

  return NextResponse.json({ ok: true });
}
