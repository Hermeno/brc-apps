import { prisma } from './prisma';
import { sendMail, notificationHtml } from './email';
import { BASE_URL } from './base-url';

export type NotificationType =
  | 'lead_received'
  | 'cleaner_responded'
  | 'client_accepted'
  | 'message_received'
  | 'job_completed'
  | 'review_received'
  | 'lead_unmatched'
  | 'verification_approved'
  | 'verification_rejected'
  | 'payment_failed'
  | 'card_added'
  | 'referral_qualified'
  | 'referral_credit_earned';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

/**
 * Notifications that also go out by email.
 *
 * An in-app notification only reaches someone who happens to have the dashboard
 * open. These are the ones with a deadline attached — a wave lasts 90 seconds and
 * an unpaid lead fee expires in 24 hours — so they have to reach the person who
 * closed the tab. Chat messages are deliberately excluded: too frequent to mail.
 */
const EMAIL_TYPES: Record<string, { label: string; urgent: boolean }> = {
  lead_received:     { label: 'View the lead',      urgent: true  },
  client_accepted:   { label: 'Open the chat',      urgent: true  },
  cleaner_responded: { label: 'Review the cleaner', urgent: true  },
  lead_unmatched:    { label: 'Open my booking',    urgent: false },
  payment_failed:    { label: 'Fix my payment',     urgent: false },
  job_completed:     { label: 'View the job',       urgent: false },
};

/**
 * Emails a notification without ever holding up the caller.
 *
 * Matching runs inside after(), so a slow or unreachable SMTP host must not be
 * able to stall lead dispatch — every failure is swallowed and logged.
 */
async function emailNotification(input: CreateNotificationInput): Promise<void> {
  const config = EMAIL_TYPES[input.type];
  if (!config) return;

  try {
    const user = await prisma.user.findUnique({
      where:  { id: input.userId },
      select: { email: true, name: true, deletedAt: true },
    });
    if (!user?.email || user.deletedAt) return;

    await sendMail({
      to:      user.email,
      subject: input.title,
      html:    notificationHtml({
        name:     user.name ?? 'there',
        title:    input.title,
        body:     input.body,
        ctaUrl:   `${BASE_URL}${input.link ?? '/dashboard'}`,
        ctaLabel: config.label,
        urgent:   config.urgent,
      }),
    });
  } catch (e: any) {
    console.error(`[notifications] email ${input.type}: ${e?.message ?? e}`);
  }
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    await prisma.notification.create({ data: input });
  } catch (e: any) {
    console.error(`[notifications] create: ${e?.message ?? e}`);
    return;
  }
  // Not awaited: the in-app notification is already saved and is what the UI
  // reads. The email is a best-effort second channel.
  void emailNotification(input);
}

export async function createNotificationMany(inputs: CreateNotificationInput[]) {
  if (!inputs.length) return;
  try {
    await prisma.notification.createMany({ data: inputs });
  } catch (e: any) {
    console.error(`[notifications] createMany: ${e?.message ?? e}`);
    return;
  }
  for (const input of inputs) void emailNotification(input);
}
