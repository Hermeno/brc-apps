import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { url, caption } = await req.json();
  if (!url?.trim()) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

  const count = await prisma.workPhoto.count({ where: { cleanerId: user.id } });
  if (count >= 20) return NextResponse.json({ error: 'Maximum of 20 photos reached' }, { status: 400 });

  const photo = await prisma.workPhoto.create({
    data: { cleanerId: user.id, url: url.trim(), caption: caption?.trim() || null },
  });

  return NextResponse.json({ photo }, { status: 201 });
}
