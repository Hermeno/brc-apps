// When the visits of a recurring booking fall. The first visit is the booked
// dateTime; each next one keeps its local time of day, every CYCLE_DAYS days.
// Pure date math, shared by the client's "next cycle", the cleaner's calendar
// and the visit reminders.
export const CYCLE_DAYS: Record<string, number> = { weekly: 7, biweekly: 14, monthly: 30 };

export const isRecurring = (frequency: string | null | undefined) => Boolean(frequency && CYCLE_DAYS[frequency]);

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** The first visit after `after`, once the booked one has passed; null for one-off bookings. */
export function nextVisit(first: Date, frequency: string, after = new Date()): Date | null {
  const step = CYCLE_DAYS[frequency];
  if (!step || first > after) return null;
  let visit = first;
  while (visit <= after) visit = addDays(visit, step);
  return visit;
}

/** The visits after the booked one that fall within [from, to]. */
export function repeatVisits(first: Date, frequency: string, from: Date, to: Date): Date[] {
  const step = CYCLE_DAYS[frequency];
  const visits: Date[] = [];
  if (!step) return visits;
  for (let visit = addDays(first, step); visit <= to; visit = addDays(visit, step)) {
    if (visit >= from) visits.push(visit);
  }
  return visits;
}
