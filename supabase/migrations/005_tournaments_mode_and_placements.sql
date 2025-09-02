-- Migration 005: Add tournament mode (bracket|room) and placements table

ALTER TABLE IF EXISTS tournaments
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'bracket',
  ADD COLUMN IF NOT EXISTS room_code TEXT;

-- Create placements table to record final standings and awarded points
CREATE TABLE IF NOT EXISTS tournament_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  placement INTEGER NOT NULL,
  points_awarded INTEGER NOT NULL,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tournament_placements_tournament_id ON tournament_placements(tournament_id);
