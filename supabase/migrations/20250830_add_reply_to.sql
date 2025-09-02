-- Migration: add reply_to column to chat_messages
-- Created: 2025-08-30

-- NOTE: Verify the type of chat_messages.id before running. If id is uuid, use the UUID variant below.

-- UUID variant (recommended if your id column is uuid):
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS reply_to uuid;

-- Add FK constraint if it doesn't already exist (Postgres doesn't support ADD CONSTRAINT IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_chat_messages_reply_to'
  ) THEN
    EXECUTE 'ALTER TABLE public.chat_messages ADD CONSTRAINT fk_chat_messages_reply_to FOREIGN KEY (reply_to) REFERENCES public.chat_messages(id) ON DELETE SET NULL';
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to ON public.chat_messages(reply_to);

-- Text variant (if your id column is text/varchar) - uncomment and use instead of the UUID variant:
-- ALTER TABLE public.chat_messages
--   ADD COLUMN IF NOT EXISTS reply_to text;
--
-- CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to ON public.chat_messages(reply_to);

-- Optional: backfill or data migration steps can go here if you want to populate reply_to values from other sources.
