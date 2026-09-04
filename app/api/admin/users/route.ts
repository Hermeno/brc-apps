import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { hasRealCoords, resolveCoords } from '@/lib/geo';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
    if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const users = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' }, deletedAt: null },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        address: true, zipCode: true, latitude: true, longitude: true,
        isVerified: true, suspendedUntil: true,
        createdAt: true, plan: true, isAvailable: true, deletedAt: true,
        subscriptionEndsAt: true,
        // Presence of a card on file only — never card details.
        hasPaymentMethod: true,
        verification: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Whether matching can actually place this cleaner. It has to be decided
    // here, not in the browser: resolveCoords falls back to the ZIP centroid,
    // and that lookup needs the ZIP dataset, which is far too large to ship to
    // the client. Judging by latitude/longitude alone flags cleaners who have a
    // perfectly good ZIP and do receive leads.
    const withLocation = users.map(u => {
      const gps      = hasRealCoords(u.latitude, u.longitude);
      const resolved = resolveCoords(u.latitude, u.longitude, u.zipCode);
      return {
        ...u,
        locationSource: gps ? 'gps' : resolved ? 'zip' : 'none',
        locatable:      resolved !== null,
      };
    });

    return NextResponse.json({ users: withLocation });
  } catch (err: any) {
    logError('[GET /api/admin/users]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
