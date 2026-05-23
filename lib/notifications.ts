import { prisma } from './prisma';

export type NotificationType =
  | 'lead_received'
  | 'cleaner_responded'
  | 'client_accepted'
  | 'message_received'
  | 'job_completed'
  | 'review_received'
  | 'lead_unmatched'
  | 'verification_approved'
  | 'verification_rejected';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    await prisma.notification.create({ data: input });
  } catch (e) {
    console.error('[notifications] failed to create:', e);
  }
}

export async function createNotificationMany(inputs: CreateNotificationInput[]) {
  if (!inputs.length) return;
  try {
    await prisma.notification.createMany({ data: inputs });
  } catch (e) {
    console.error('[notifications] failed to createMany:', e);
  }
}
