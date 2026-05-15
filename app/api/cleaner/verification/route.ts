import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const verification = await prisma.cleanerVerification.findUnique({
    where: { cleanerId: user.id },
  });

  return NextResponse.json({ verification });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const existing = await prisma.cleanerVerification.findUnique({ where: { cleanerId: user.id } });
  if (existing && existing.status === 'PENDING') {
    return NextResponse.json({ error: 'Verificação já enviada e aguardando análise.' }, { status: 409 });
  }
  if (existing && existing.status === 'APPROVED') {
    return NextResponse.json({ error: 'Conta já verificada.' }, { status: 409 });
  }

  const body = await req.json();
  const { fullName, idNumber, address, frontDocUrl, backDocUrl, selfieUrl } = body;

  if (!fullName || !idNumber || !address || !frontDocUrl || !backDocUrl || !selfieUrl) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
  }

  const verification = await prisma.cleanerVerification.upsert({
    where: { cleanerId: user.id },
    create: { cleanerId: user.id, fullName, idNumber, address, frontDocUrl, backDocUrl, selfieUrl, status: 'PENDING' },
    update: { fullName, idNumber, address, frontDocUrl, backDocUrl, selfieUrl, status: 'PENDING', adminNote: null, reviewedBy: null, reviewedAt: null },
  });

  return NextResponse.json({ verification }, { status: 201 });
}
