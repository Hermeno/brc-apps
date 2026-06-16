import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Step 1: basic user + counts
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bio: true,
        plan: true,
        role: true,
        serviceTypes: true,
        avatarUrl: true,
        latitude: true,
        longitude: true,
        zipCode: true,
        serviceRadiusMiles: true,
        phone: true,
        createdAt: true,
        stats: { select: { ratingAvg: true, totalLeads: true } },
      },
    });

    if (!user || user.role !== 'CLEANER') {
      return NextResponse.json({ error: 'Cleaner not found' }, { status: 404 });
    }

    // Step 2: work photos
    const workPhotos = await prisma.workPhoto.findMany({
      where: { cleanerId: id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, url: true, caption: true, createdAt: true },
    });

    // Step 3: completed job count
    const completedJobs = await prisma.lead.count({
      where: { cleanerId: id, status: 'COMPLETED' },
    });

    // Step 4: reviews
    const cleanerReviews = await prisma.review.findMany({
      where: { cleanerId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        client: { select: { name: true } },
        lead:   { select: { serviceType: true } },
      },
    });

    // Check if the viewer is a client with an accepted conversation with this cleaner
    let canSeeContact = false;
    let isOwner = false;
    try {
      const session = await auth();
      if (session?.user?.email) {
        const viewer = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, role: true },
        });
        if (viewer?.id === id) {
          isOwner = true;
        } else if (viewer?.role === 'CLIENT') {
          const acceptedConv = await prisma.conversation.findFirst({
            where: {
              cleanerId: id,
              clientId:  viewer.id,
              status:    'active',
              lead:      { status: 'ACCEPTED' },
              feeStatus: 'charged',
            },
          });
          canSeeContact = !!acceptedConv;
        }
      }
    } catch {}

    const { role: _role, ...cleanerData } = user;

    return NextResponse.json({
      cleaner: {
        ...cleanerData,
        phone:    (canSeeContact || isOwner) ? (user as any).phone ?? null : undefined,
        workPhotos,
        cleanerReviews,
        completedJobs,
        canSeeContact,
      },
    });
  } catch (err: any) {
    console.error('[profile/[id]] error:', err?.message, err?.code);
    return NextResponse.json({ error: err?.message ?? 'Erro interno' }, { status: 500 });
  }
}
