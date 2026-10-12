import { prisma } from '@/lib/prisma';

// When a settled lead fee may still be handed back.
//
// The fee buys one thing: the client's contact details. Settling it is exactly
// what unlocks the chat, the phone number and the street address — so from the
// instant the fee is charged, the cleaner is holding something they cannot
// return. Refunding after that point makes the platform free to use: respond,
// pay, read the number, cancel, take the money back, call the client directly.
//
// So a settled fee is not refunded automatically, by either side. That is a
// deliberate business rule, not an oversight, and the places that used to refund
// now say so in the notification they send.
//
// Two things are deliberately left out of this rule:
//
//   • The race loser. When two cleaners pay for the same lead at once, the one
//     whose conversation hits the unique constraint never gets a conversation,
//     never sees a contact, and is refunded in the Stripe webhook. Nothing was
//     delivered, so nothing is being kept.
//
//   • Genuine grievances. A cleaner who paid and was wronged opens a Dispute,
//     which an admin resolves and can refund by hand in Stripe. An exception
//     decided by a person is the right shape for this; an automatic refund that
//     anyone can trigger is not.

export type FeeOutcome = {
  refundable: boolean;
  /** What the conversation's feeStatus should become. */
  feeStatus:  'charged' | 'waived' | 'refunded';
  /** Explains the decision to the cleaner, in the notification. */
  reason:     string;
};

// `feeStatus` is the conversation's current value.
export function resolveFeeOnCancellation(feeStatus: string | null | undefined): FeeOutcome {
  if (feeStatus === 'charged') {
    return {
      refundable: false,
      feeStatus:  'charged',
      reason:     'The lead fee is not returned once the chat has been opened, because the client’s contact details were already shared. Open a dispute if you believe this is wrong.',
    };
  }

  // Nothing was ever taken: pending, failed, or already refunded by the webhook.
  return {
    refundable: false,
    feeStatus:  'waived',
    reason:     'No lead fee was charged for this booking.',
  };
}

// True once either side has spoken in the conversation. Not used to decide the
// refund — the contact is already visible before the first message — but it is
// what the cleaner's notification and the admin dispute view need in order to
// describe what actually happened.
export async function hasConversationStarted(conversationId: string): Promise<boolean> {
  const count = await prisma.message.count({ where: { conversationId }, take: 1 });
  return count > 0;
}
