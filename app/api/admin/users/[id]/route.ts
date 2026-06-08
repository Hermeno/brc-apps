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

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, name, email, phone, address, zipCode, suspendDays } = body;

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

    if (action === 'verify') {
      const user = await prisma.user.update({ where: { id }, data: { isVerified: true } });
      return NextResponse.json({ user });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name    !== undefined && { name }),
        ...(email   !== undefined && { email }),
        ...(phone   !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(zipCode !== undefined && { zipCode: zipCode ?? null, latitude: 0, longitude: 0 }),
      },
    });
    return NextResponse.json({ user });
  } catch (err: any) {
    console.error('[PATCH /api/admin/users/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await requireAdmin(session.user.email))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { id } = await params;

    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.$transaction(async tx => {
      const clientLeadIds = await tx.lead
        .findMany({ where: { clientId: id }, select: { id: true } })
        .then(rows => rows.map(r => r.id));

      const directConvIds = await tx.conversation
        .findMany({
          where: { OR: [{ clientId: id }, { cleanerId: id }] },
          select: { id: true },
        })
        .then(rows => rows.map(r => r.id));

      const leadConvIds = clientLeadIds.length > 0
        ? await tx.conversation
            .findMany({ where: { leadId: { in: clientLeadIds } }, select: { id: true } })
            .then(rows => rows.map(r => r.id))
        : [];

      const allConvIds = [...new Set([...directConvIds, ...leadConvIds])];

      if (allConvIds.length > 0) {
        await tx.message.deleteMany({ where: { conversationId: { in: allConvIds } } });
      }

      if (clientLeadIds.length > 0) {
        await tx.leadDistribution.deleteMany({ where: { leadId: { in: clientLeadIds } } });
        await tx.review.deleteMany({ where: { leadId: { in: clientLeadIds } } });
      }

      await tx.lead.updateMany({ where: { cleanerId: id }, data: { cleanerId: null } });
      await tx.leadDistribution.deleteMany({ where: { cleanerId: id } });
      await tx.review.deleteMany({ where: { cleanerId: id } });

      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.workPhoto.deleteMany({ where: { cleanerId: id } });
      await tx.cleanerVerification.deleteMany({ where: { cleanerId: id } });
      await tx.cleanerStats.deleteMany({ where: { cleanerId: id } });
      await tx.verificationToken.deleteMany({ where: { userId: id } });

      if (allConvIds.length > 0) {
        await tx.conversation.deleteMany({ where: { id: { in: allConvIds } } });
      }

      if (clientLeadIds.length > 0) {
        await tx.lead.deleteMany({ where: { clientId: id } });
      }

      await tx.user.delete({ where: { id } });
    }, { timeout: 30000 });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[DELETE /api/admin/users/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
