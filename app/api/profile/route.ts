import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { ensureRadiusColumn } from '@/lib/geo';
import { logError } from '@/lib/logger';

const PLAN_MAX_RADIUS: Record<string, number> = { FREE: 60, BASIC: 60, PRO: 110, PREMIUM: 110 };

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, plan: true },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await ensureRadiusColumn();

    const { bio, serviceTypes, avatarUrl, latitude, longitude, serviceRadiusMiles, zipCode, phone } = await req.json();

    if (serviceRadiusMiles !== undefined) {
      const maxRadius = PLAN_MAX_RADIUS[user.plan ?? 'FREE'] ?? 60;
      if (Number(serviceRadiusMiles) > maxRadius) {
        return NextResponse.json(
          { error: `Your ${user.plan} plan allows a maximum radius of ${maxRadius} mi. Upgrade to increase it.` },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(bio                !== undefined && { bio:       bio || null }),
        ...(serviceTypes       !== undefined && { serviceTypes }),
        ...(avatarUrl          !== undefined && { avatarUrl: avatarUrl || null }),
        ...(latitude           !== undefined && latitude  !== null && { latitude:  Number(latitude)  }),
        ...(longitude          !== undefined && longitude !== null && { longitude: Number(longitude) }),
        ...(serviceRadiusMiles !== undefined && { serviceRadiusMiles: Number(serviceRadiusMiles) }),
        ...(zipCode             !== undefined && { zipCode: zipCode || null }),
        ...(phone               !== undefined && { phone: phone || null }),
      },
      select: { bio: true, serviceTypes: true, avatarUrl: true, latitude: true, longitude: true, serviceRadiusMiles: true, zipCode: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    logError('[PUT /api/profile]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
