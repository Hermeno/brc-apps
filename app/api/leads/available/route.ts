import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { redactLeadForCleaner, leadForCleaner } from '@/lib/lead-visibility';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const cityFilter = searchParams.get('city')?.toLowerCase().trim() ?? '';

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        role: true,
        cleanerConvos: {
          where: { status: 'active' },
          include: { lead: { include: { client: { select: { name: true } } } } },
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!dbUser || dbUser.role !== 'CLEANER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // The city filter still matches on the full stored address, so a cleaner can
    // narrow by town without that address being sent back to them.
    const cityWhere = cityFilter
      ? { address: { contains: cityFilter, mode: 'insensitive' as const } }
      : {};

    const [available, accepted] = await Promise.all([
      prisma.lead.findMany({
        where: {
          status: { in: ['WAVE2', 'WAVE3', 'NEW', 'IN_REVIEW'] },
          distributions: { some: { cleanerId: dbUser.id, status: 'INVITED' } },
          conversations: { none: { cleanerId: dbUser.id } },
          ...cityWhere,
        },
        include: {
          client: { select: { name: true } },
          distributions: {
            where: { cleanerId: dbUser.id },
            select: { id: true, status: true, wave: true, expiresAt: true, notifiedAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.findMany({
        where: { cleanerId: dbUser.id, status: { in: ['IN_REVIEW', 'ACCEPTED', 'COMPLETED'] } },
        include: {
          client: { select: { name: true } },
          // The fee lives on the conversation, so it has to come back with the
          // lead to decide whether this cleaner has earned the full detail.
          conversations: {
            where:  { cleanerId: dbUser.id },
            select: { feeStatus: true },
            take:   1,
          },
        },
        orderBy: { dateTime: 'asc' },
      }),
    ]);

    return NextResponse.json({
      // No conversation exists for these yet — the query above requires it — so
      // the fee cannot have been settled and the detail is always withheld.
      available: available.map(redactLeadForCleaner),

      // Assigned to this cleaner, but IN_REVIEW can still be sitting unpaid.
      accepted: accepted.map(lead => leadForCleaner(lead, lead.conversations[0]?.feeStatus)),

      conversations: dbUser.cleanerConvos.map(conv => ({
        ...conv,
        lead: leadForCleaner(conv.lead, conv.feeStatus),
      })),
    });
  } catch (err: any) {
    logError('[leads/available]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
