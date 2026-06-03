import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, plan: true, zipCode: true, role: true, stripeSubscriptionId: true },
  });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ id: user.id, plan: user.plan, zipCode: user.zipCode, stripeSubscriptionId: user.stripeSubscriptionId });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'CLEANER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Plan changes are handled exclusively via Stripe Checkout → webhook.
  // Only service-area metadata (zipCode) can be updated here.
  const { zipCode } = await req.json();

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { ...(zipCode !== undefined && { zipCode: zipCode || null }) },
    select: { plan: true, zipCode: true },
  });

  return NextResponse.json(updated);
}
