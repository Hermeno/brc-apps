import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { coordsFromZip, hasRealCoords, normalizeZip } from '@/lib/geo';
import { NextResponse } from 'next/server';
import { logError, logInfo } from '@/lib/logger';

// Repairs cleaner locations so the wave engine can measure distance to them.
//
// A cleaner with no usable coordinates is skipped by every wave — that is how a
// lead reaches nobody while cleaners sit well inside the radius. New and edited
// profiles are validated at the door now; this fixes the ones saved before that.
export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const me = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { role: true },
    });
    if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const cleaners = await prisma.user.findMany({
      where:  { role: 'CLEANER', deletedAt: null },
      select: { id: true, name: true, email: true, latitude: true, longitude: true, zipCode: true },
    });

    let repaired = 0;
    let alreadyOk = 0;
    const unlocatable: { id: string; name: string | null; email: string; zipCode: string | null }[] = [];

    for (const c of cleaners) {
      const validZip = normalizeZip(c.zipCode);

      // A ZIP the dataset doesn't know is worse than none: it looks set but
      // resolves to nothing. Clear it so the account reads as "no location".
      const zipChanged = (validZip ?? null) !== (c.zipCode ?? null);

      if (hasRealCoords(c.latitude, c.longitude)) {
        if (zipChanged) {
          await prisma.user.update({ where: { id: c.id }, data: { zipCode: validZip } });
          repaired++;
        } else {
          alreadyOk++;
        }
        continue;
      }

      const centroid = validZip ? coordsFromZip(validZip) : null;
      if (centroid) {
        await prisma.user.update({
          where: { id: c.id },
          data:  { latitude: centroid.lat, longitude: centroid.lng, zipCode: validZip },
        });
        repaired++;
        continue;
      }

      if (zipChanged) await prisma.user.update({ where: { id: c.id }, data: { zipCode: null } });
      unlocatable.push({ id: c.id, name: c.name, email: c.email, zipCode: c.zipCode });
    }

    logInfo('[POST /api/admin/sync-geo]', 'Cleaner locations resynced', {
      checked: cleaners.length, repaired, alreadyOk, unlocatable: unlocatable.length,
    });

    return NextResponse.json({
      checked: cleaners.length,
      repaired,
      alreadyOk,
      // These cleaners receive no leads at all until they set a location.
      unlocatable,
    });
  } catch (err) {
    logError('[POST /api/admin/sync-geo]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
