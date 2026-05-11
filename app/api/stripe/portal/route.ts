import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, BASE_URL } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada' }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   user.stripeCustomerId,
    return_url: `${BASE_URL}/dashboard/plan`,
  });

  return NextResponse.json({ url: portalSession.url });
}
