import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logError, logInfo } from '@/lib/logger';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const where =
      user.role === 'CLIENT'  ? { clientId:  user.id } :
      user.role === 'CLEANER' ? { cleanerId: user.id } :
      {};

    const disputes = await prisma.dispute.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client:  { select: { name: true, email: true } },
        cleaner: { select: { name: true, email: true } },
      },
    });
    return NextResponse.json({ disputes });
  } catch (err: any) {
    logError('[GET /api/disputes]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user || user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { leadId, cleanerId, clientId, reason, description } = body;

    if (!reason || !description || !cleanerId || !clientId) {
      return NextResponse.json({ error: 'reason, description, cleanerId and clientId are required' }, { status: 400 });
    }

    // Verify the user is one of the parties
    if (user.role === 'CLIENT'  && user.id !== clientId)  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (user.role === 'CLEANER' && user.id !== cleanerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const dispute = await prisma.dispute.create({
      data: { leadId, clientId, cleanerId, reason, description },
    });

    logInfo('[disputes]', `New dispute created: ${dispute.id}`, { leadId, clientId, cleanerId }, user.id);

    return NextResponse.json({ dispute }, { status: 201 });
  } catch (err: any) {
    logError('[POST /api/disputes]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
