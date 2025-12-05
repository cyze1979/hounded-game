/*
  # Add Time System and Track Records Persistence

  1. Changes to game_sessions Table
    - Add `current_month` (1-12, starts at 1 for January)
    - Add `current_year` (starts at 2048)
    
  2. New Tables
    - `track_records` - Persistent track records per session
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `track_name` (text)
      - `best_time` (float)
      - `best_time_holder` (text)
      - `races_held` (integer)
      - `last_winner` (text)
      
    - `market_dogs` - Persistent market dogs per session
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `dog_data` (jsonb, full dog object)
      - `slot` (integer, 0-7 for 8 market slots)
      
  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated access
*/

-- Add time system columns to game_sessions
ALTER TABLE game_sessions 
  ADD COLUMN IF NOT EXISTS current_month INTEGER DEFAULT 1 CHECK (current_month >= 1 AND current_month <= 12),
  ADD COLUMN IF NOT EXISTS current_year INTEGER DEFAULT 2048 CHECK (current_year >= 2048);

-- Create track_records table
CREATE TABLE IF NOT EXISTS track_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  track_name TEXT NOT NULL,
  best_time FLOAT,
  best_time_holder TEXT,
  races_held INTEGER DEFAULT 0,
  last_winner TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, track_name)
);

ALTER TABLE track_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view track records"
  ON track_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert track records"
  ON track_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update track records"
  ON track_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create market_dogs table
CREATE TABLE IF NOT EXISTS market_dogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  dog_data JSONB NOT NULL,
  slot INTEGER NOT NULL CHECK (slot >= 0 AND slot <= 7),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, slot)
);

ALTER TABLE market_dogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view market dogs"
  ON market_dogs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert market dogs"
  ON market_dogs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update market dogs"
  ON market_dogs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete market dogs"
  ON market_dogs FOR DELETE
  TO authenticated
  USING (true);