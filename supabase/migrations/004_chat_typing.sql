-- Migration 004: Chat typing / ephemeral presence
-- Creates a small table to track who is currently typing in a room. Entries are updated frequently and read by clients to show typing indicators.

CREATE TABLE IF NOT EXISTS chat_typing (
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_typing_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_typing_room_id ON chat_typing(room_id);

-- Enable RLS and allow authenticated users to upsert their typing entry and read typing info
ALTER TABLE chat_typing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read typing" ON chat_typing
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can upsert their typing" ON chat_typing
  FOR INSERT, UPDATE
  WITH CHECK (user_id = auth.uid());

-- Allow delete by the owner (used on leave/cleanup)
CREATE POLICY "Users can delete their typing" ON chat_typing
  FOR DELETE
  USING (user_id = auth.uid());

-- Optionally a cleanup job (not included here) should remove old rows where last_typing_at < now() - interval '30 seconds'
