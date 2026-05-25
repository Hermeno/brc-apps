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

  await prisma.$transaction(async tx => {
    // ── 1. Collect IDs inside the transaction (no stale-data races) ────────────
    const clientLeadIds = await tx.lead
      .findMany({ where: { clientId: id }, select: { id: true } })
      .then(rows => rows.map(r => r.id));

    // All conversations directly involving this user
    const directConvIds = await tx.conversation
      .findMany({
        where: { OR: [{ clientId: id }, { cleanerId: id }] },
        select: { id: true },
      })
      .then(rows => rows.map(r => r.id));

    // Any conversations that reference this user's client-leads (even if conv's
    // clientId/cleanerId is different — these block the lead delete via leadId FK)
    const leadConvIds = clientLeadIds.length > 0
      ? await tx.conversation
          .findMany({ where: { leadId: { in: clientLeadIds } }, select: { id: true } })
          .then(rows => rows.map(r => r.id))
      : [];

    const allConvIds = [...new Set([...directConvIds, ...leadConvIds])];

    // ── 2. Messages (children of conversations) ─────────────────────────────────
    if (allConvIds.length > 0) {
      await tx.message.deleteMany({ where: { conversationId: { in: allConvIds } } });
    }

    // ── 3. Children of client-owned leads ──────────────────────────────────────
    if (clientLeadIds.length > 0) {
      await tx.leadDistribution.deleteMany({ where: { leadId: { in: clientLeadIds } } });
      await tx.review.deleteMany({ where: { leadId: { in: clientLeadIds } } });
    }

    // ── 4. Cleaner-side references on other users' leads ───────────────────────
    await tx.lead.updateMany({ where: { cleanerId: id }, data: { cleanerId: null } });
    await tx.leadDistribution.deleteMany({ where: { cleanerId: id } });
    await tx.review.deleteMany({ where: { cleanerId: id } });

    // ── 5. Standalone profile / account records ────────────────────────────────
    await tx.notification.deleteMany({ where: { userId: id } });
    await tx.workPhoto.deleteMany({ where: { cleanerId: id } });
    await tx.cleanerVerification.deleteMany({ where: { cleanerId: id } });
    await tx.cleanerStats.deleteMany({ where: { cleanerId: id } });
    await tx.verificationToken.deleteMany({ where: { userId: id } });

    // ── 6. Conversations — MUST come before leads (Conversation.leadId → Lead) ─
    if (allConvIds.length > 0) {
      await tx.conversation.deleteMany({ where: { id: { in: allConvIds } } });
    }

    // ── 7. Client-owned leads — safe now that all conversations are gone ────────
    if (clientLeadIds.length > 0) {
      await tx.lead.deleteMany({ where: { clientId: id } });
    }

    // ── 8. Delete the user ──────────────────────────────────────────────────────
    await tx.user.delete({ where: { id } });
  }, { timeout: 30000 });

  return NextResponse.json({ ok: true });
}
