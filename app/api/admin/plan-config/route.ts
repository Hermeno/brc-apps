import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/pricing';
import { NextRequest, NextResponse } from 'next/server';

const PAID_PLANS = PLANS.filter(p => p.price > 0);

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  return me?.role === 'ADMIN' ? me : null;
}

// GET — returns current prices (same data the cleaner sees)
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Auto-seed rows that don't exist yet (never overwrites an admin-set price)
  for (const plan of PAID_PLANS) {
    await prisma.planConfig.upsert({
      where:  { id: plan.id },
      create: { id: plan.id, price: plan.price },
      update: {},
    });
  }

  const configs = await prisma.planConfig.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(configs);
}

// PATCH — update a plan price: { id: 'BASIC', price: 35 }
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, price } = await req.json();
  const validIds = PAID_PLANS.map(p => p.id as string);
  if (!validIds.includes(id)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }
  if (typeof price !== 'number' || price < 1) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  const config = await prisma.planConfig.upsert({
    where:  { id },
    create: { id, price },
    update: { price },
  });
  return NextResponse.json(config);
}
