import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { bio, serviceTypes, avatarUrl, latitude, longitude } = await req.json();

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(bio          !== undefined && { bio:       bio || null }),
      ...(serviceTypes !== undefined && { serviceTypes }),
      ...(avatarUrl    !== undefined && { avatarUrl: avatarUrl || null }),
      ...(latitude     !== undefined && latitude  !== null && { latitude:  Number(latitude)  }),
      ...(longitude    !== undefined && longitude !== null && { longitude: Number(longitude) }),
    },
    select: { bio: true, serviceTypes: true, avatarUrl: true, latitude: true, longitude: true },
  });

  return NextResponse.json(updated);
}
