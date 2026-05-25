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
    // Step 1: delete messages (children of conversations)
    if (convIds.length > 0) {
      await tx.message.deleteMany({ where: { conversationId: { in: convIds } } });
    }

    // Step 2: delete lead children and profile records in parallel
    await Promise.all([
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
      tx.notification.deleteMany({ where: { userId: id } }),
      tx.workPhoto.deleteMany({ where: { cleanerId: id } }),
      tx.cleanerVerification.deleteMany({ where: { cleanerId: id } }),
      tx.cleanerStats.deleteMany({ where: { cleanerId: id } }),
      tx.verificationToken.deleteMany({ where: { userId: id } }),
    ]);

    // Step 3: delete conversations — MUST happen before leads (Conversation.leadId → Lead FK)
    if (convIds.length > 0) {
      await tx.conversation.deleteMany({ where: { OR: [{ clientId: id }, { cleanerId: id }] } });
    }

    // Step 4: delete leads — safe now that conversations referencing them are gone
    if (target.role === 'CLIENT' && leadIds.length > 0) {
      await tx.lead.deleteMany({ where: { clientId: id } });
    }

    // Step 5: delete the user
    await tx.user.delete({ where: { id } });
  }, { timeout: 30000 });

  return NextResponse.json({ ok: true });
}
