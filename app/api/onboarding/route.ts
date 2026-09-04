import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { clampRadiusForPlan } from '@/lib/plans';
import { normalizeZip, coordsFromZip, hasRealCoords } from '@/lib/geo';

// GET — returns current profile data for pre-filling the wizard
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true, role: true, plan: true,
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
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, plan: true, latitude: true, longitude: true },
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

      // An unrecognised ZIP resolves to no coordinates, and a cleaner without
      // coordinates is silently skipped by every wave. Reject it at the door.
      let validZip: string | null = null;
      if (data.zipCode != null && String(data.zipCode).trim()) {
        validZip = normalizeZip(String(data.zipCode));
        if (!validZip) {
          return NextResponse.json(
            { error: 'That ZIP code does not exist. Enter a valid 5-digit US ZIP.' },
            { status: 400 },
          );
        }
        updates.zipCode = validZip;
      } else if (data.zipCode !== undefined) {
        updates.zipCode = null;
      }

      // No GPS here or on file → use the ZIP centroid, so distance to a lead is
      // always measurable. Real GPS is more precise and is never overwritten.
      const missingCoords =
        !hasRealCoords(data.latitude as number, data.longitude as number) &&
        !hasRealCoords(user.latitude, user.longitude);
      if (missingCoords && validZip) {
        const centroid = coordsFromZip(validZip);
        if (centroid) {
          updates.latitude  = centroid.lat;
          updates.longitude = centroid.lng;
        }
      }

      if (data.serviceRadiusMiles != null) {
        updates.serviceRadiusMiles = clampRadiusForPlan(Number(data.serviceRadiusMiles), user.plan);
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
