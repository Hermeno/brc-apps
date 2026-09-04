import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { ensureRadiusColumn, normalizeZip, coordsFromZip, hasRealCoords } from '@/lib/geo';
import { logError } from '@/lib/logger';
import { maxRadiusForPlan, clampRadiusForPlan } from '@/lib/plans';

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, plan: true, latitude: true, longitude: true },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await ensureRadiusColumn();

    const { bio, serviceTypes, avatarUrl, latitude, longitude, serviceRadiusMiles, zipCode, phone } = await req.json();

    if (serviceRadiusMiles !== undefined) {
      const maxRadius = maxRadiusForPlan(user.plan);
      if (Number(serviceRadiusMiles) > maxRadius) {
        return NextResponse.json(
          { error: `Your ${user.plan} plan allows a maximum radius of ${maxRadius} mi. Upgrade to increase it.` },
          { status: 400 },
        );
      }
    }

    // A ZIP that isn't in the dataset yields no coordinates, and a cleaner without
    // coordinates is dropped from every wave with nothing to explain it. Reject it
    // here instead of letting them sit invisible.
    let validZip: string | null = null;
    if (zipCode !== undefined && zipCode) {
      validZip = normalizeZip(zipCode);
      if (!validZip) {
        return NextResponse.json(
          { error: 'That ZIP code does not exist. Enter a valid 5-digit US ZIP.' },
          { status: 400 },
        );
      }
    }

    // Without GPS — in this request or already stored — fall back to the ZIP
    // centroid so distance is always measurable. Stored GPS is more precise than
    // a centroid, so it is never overwritten.
    const missingCoords =
      !hasRealCoords(latitude, longitude) && !hasRealCoords(user.latitude, user.longitude);
    const zipFallback = missingCoords && validZip ? coordsFromZip(validZip) : null;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(bio                !== undefined && { bio:       bio || null }),
        ...(serviceTypes       !== undefined && { serviceTypes }),
        ...(avatarUrl          !== undefined && { avatarUrl: avatarUrl || null }),
        ...(latitude           !== undefined && latitude  !== null && { latitude:  Number(latitude)  }),
        ...(longitude          !== undefined && longitude !== null && { longitude: Number(longitude) }),
        ...(zipFallback && { latitude: zipFallback.lat, longitude: zipFallback.lng }),
        // Store the clamped value — never trust the raw number past the plan cap.
        ...(serviceRadiusMiles !== undefined && { serviceRadiusMiles: clampRadiusForPlan(Number(serviceRadiusMiles), user.plan) }),
        ...(zipCode             !== undefined && { zipCode: validZip }),
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
