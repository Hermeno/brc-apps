import { prisma } from './prisma';
import { createNotification } from './notifications';
import { approximateArea, isFeeSettled } from './lead-visibility';
import { CYCLE_DAYS, nextVisit } from './recurrence';
import { serviceLabel } from './estimate';

const REMIND_MS = 24 * 60 * 60 * 1000;

// One reminder per visit once it is less than a day away: the booked time of an
// accepted job, and the next expected visit of a recurring client whose paid chat is
// still open. The notification link is the dedupe key. Runs in the minute loop,
// which only one app instance holds at a time (instrumentation.ts).
export async function sendVisitReminders(now = new Date()): Promise<number> {
  const horizon = new Date(now.getTime() + REMIND_MS);
  const leads = await prisma.lead.findMany({
    where: {
      cleanerId: { not: null },
      OR: [
        { status: 'ACCEPTED', dateTime: { gt: now, lte: horizon } },
        { status: { in: ['ACCEPTED', 'COMPLETED'] }, frequency: { in: Object.keys(CYCLE_DAYS) }, dateTime: { lte: now },
          conversations: { some: { status: 'active' } } },
      ],
    },
    select: {
      id: true, cleanerId: true, serviceType: true, address: true, zipCode: true, dateTime: true, frequency: true,
      conversations: { where: { status: 'active' }, select: { cleanerId: true, feeStatus: true } },
    },
  });

  let sent = 0;
  for (const lead of leads) {
    if (!lead.cleanerId) continue;
    const recurring = lead.dateTime <= now;
    const visit = recurring ? nextVisit(lead.dateTime, lead.frequency, now) : lead.dateTime;
    if (!visit || visit > horizon) continue;
    // A series only runs on while this cleaner's chat is open and paid for.
    if (recurring && !lead.conversations.some(c => c.cleanerId === lead.cleanerId && isFeeSettled(c.feeStatus))) continue;

    const link = `/dashboard/schedule?at=${visit.getTime()}&lead=${lead.id}`;
    const already = await prisma.notification.findFirst({ where: { userId: lead.cleanerId, type: 'job_reminder', link }, select: { id: true } });
    if (already) continue;

    // The server can't know the cleaner's time zone, so say how far off it is, not the clock time.
    const hours = Math.max(1, Math.round((visit.getTime() - now.getTime()) / 3_600_000));
    await createNotification({
      userId: lead.cleanerId,
      type:   'job_reminder',
      title:  `${recurring ? 'Recurring visit' : 'Upcoming job'}: ${serviceLabel(lead.serviceType, 'en')} in about ${hours} hour${hours === 1 ? '' : 's'}`,
      body:   recurring
        ? `Expected from the recurring schedule, in ${approximateArea(lead.address, lead.zipCode)}. Confirm the time with your client in the chat.`
        : `In ${approximateArea(lead.address, lead.zipCode)}. Open your schedule for the details.`,
      link,
    });
    sent++;
  }
  return sent;
}
