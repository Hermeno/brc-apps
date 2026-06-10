import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

// GET — returns current profile data for pre-filling the wizard
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true, role: true,
        serviceTypes: true, bio: true, avatarUrl: true,
        latitude: true, longitude: true, serviceRadiusMiles: true, zipCode: true,
      },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ user });
  } catch (err: any) {
    logError('[GET /api/onboarding]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — saves a wizard step
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const PLAN_MAX_RADIUS: Record<string, number> = { FREE: 25, BASIC: 40, PRO: 60, PREMIUM: 60 };

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, plan: true },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { step, data } = body as {
      step: 'services' | 'location' | 'bio' | 'complete';
      data?: Record<string, unknown>;
    };

    const updates: Record<string, unknown> = {};

    if (step === 'services' && data) {
      const types = (data.serviceTypes as string[]) ?? [];
      if (types.length === 0) return NextResponse.json({ error: 'Select at least one service' }, { status: 400 });
      updates.serviceTypes = types;
    }

    if (step === 'location' && data) {
      if (data.latitude  != null) updates.latitude  = Number(data.latitude);
      if (data.longitude != null) updates.longitude = Number(data.longitude);
      if (data.zipCode   != null) updates.zipCode   = String(data.zipCode);
      if (data.serviceRadiusMiles != null) {
        const maxRadius = PLAN_MAX_RADIUS[user.plan ?? 'FREE'] ?? 25;
        updates.serviceRadiusMiles = Math.min(Number(data.serviceRadiusMiles), maxRadius);
      }
    }

    if (step === 'bio' && data) {
      if (data.bio       !== undefined) updates.bio       = data.bio || null;
      if (data.avatarUrl !== undefined) updates.avatarUrl = data.avatarUrl || null;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({ where: { id: user.id }, data: updates });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    logError('[POST /api/onboarding]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
