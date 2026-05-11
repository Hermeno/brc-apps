import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const photo = await prisma.workPhoto.findUnique({ where: { id } });
  if (!photo || photo.cleanerId !== user.id) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }

  await prisma.workPhoto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
