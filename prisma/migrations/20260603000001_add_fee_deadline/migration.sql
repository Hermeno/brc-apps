-- Add feeDeadline to Conversation: tracks the 24-hour window for the cleaner to pay
-- the lead fee after the client confirms. Null means no deadline (already charged or waived).
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "feeDeadline" TIMESTAMP(3);
