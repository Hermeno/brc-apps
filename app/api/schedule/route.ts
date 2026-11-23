import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { isFeeSettled, leadForCleaner } from '@/lib/lead-visibility';
import { isRecurring } from '@/lib/recurrence';

// The cleaner's jobs for the calendar. Every lead goes through leadForCleaner, as in
// /api/leads/available: ACCEPTED does not mean paid. When the auto-charge fails the
// lead is ACCEPTED with the fee still pending, and the street stays hidden until paid.
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const leads = await prisma.lead.findMany({
      where:   { cleanerId: user.id, status: { in: ['IN_REVIEW', 'ACCEPTED', 'COMPLETED'] } },
      include: {
        client:        { select: { name: true } },
        review:        { select: { rating: true, comment: true } },
        conversations: { where: { cleanerId: user.id }, select: { id: true, status: true, feeStatus: true }, take: 1 },
      },
      orderBy: { dateTime: 'asc' },
    });

    const jobs = leads.map(({ conversations, ...lead }) => {
      const conv = conversations[0];
      return {
        ...leadForCleaner(lead, conv?.feeStatus),
        conversationId: conv?.id ?? null,
        // A recurring client stays on the calendar while their paid chat is open.
        recurring: isRecurring(lead.frequency) && conv?.status === 'active' && isFeeSettled(conv?.feeStatus),
      };
    });

    return NextResponse.json({ jobs });
  } catch (err: any) {
    logError('[GET /api/schedule]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
