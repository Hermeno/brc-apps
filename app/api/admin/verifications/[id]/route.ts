import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { action, note } = await req.json(); // action: 'approve' | 'reject'

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  }

  const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

  const verification = await prisma.cleanerVerification.update({
    where: { id },
    data: {
      status,
      adminNote:  note || null,
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  });

  if (status === 'APPROVED') {
    await prisma.user.update({
      where: { id: verification.cleanerId },
      data: { isVerified: true },
    });
  } else {
    await prisma.user.update({
      where: { id: verification.cleanerId },
      data: { isVerified: false },
    });
  }

  return NextResponse.json({ verification });
}
