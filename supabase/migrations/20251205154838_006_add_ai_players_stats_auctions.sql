/*
  # Add AI Players, Stats Tracking, and Auction System

  1. Extend Players Table
    - Add `is_ai` (boolean) to identify AI players
    - Add `total_races` (integer) to track number of races participated
    - Add `total_wins` (integer) to track total wins
    - Add `podiums` (integer) to track top 3 finishes
    - Add `total_prize_money` (integer) to track lifetime earnings
    - Add `best_month` (text) to track best performing month
    - Add `color` (text) to distinguish players visually

  2. Extend Dogs Table
    - Add `races_participated` (integer) to track race count
    - Add `best_position` (integer) to track best finish
    - Add `worst_position` (integer) to track worst finish
    - Add `average_position` (decimal) to track average finish
    - Add `total_prize_money` (integer) to track dog's earnings
    - Add `training_history` (jsonb) to store training log

  3. Extend Races Table
    - Add `participants` (jsonb) to store all race participants with details
    - Add `prize_pool` (jsonb) to store prize distribution

  4. New Tables
    - `auctions` - For dog auction system
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `dog_data` (jsonb) - Full dog details
      - `seller_id` (uuid) - Player who listed the dog
      - `starting_bid` (integer)
      - `current_bid` (integer)
      - `current_bidder_id` (uuid)
      - `status` (text) - 'active', 'sold', 'expired'
      - `created_at` (timestamp)
      - `ends_at` (timestamp)
    
    - `activity_logs` - For tracking all game events
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `player_id` (uuid) - Player who performed action
      - `month` (integer)
      - `year` (integer)
      - `event_type` (text) - 'purchase', 'sale', 'training', 'race', 'auction_bid'
      - `event_data` (jsonb) - Event details
      - `created_at` (timestamp)
    
    - `track_records` - For storing best times per track
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `track_name` (text)
      - `dog_id` (uuid)
      - `dog_name` (text)
      - `owner_id` (uuid)
      - `owner_name` (text)
      - `time` (decimal)
      - `race_id` (uuid)
      - `created_at` (timestamp)

  5. Security
    - Enable RLS on all new tables
    - Add public access policies for session-based access
*/

-- Extend players table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'is_ai') THEN
    ALTER TABLE players ADD COLUMN is_ai boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'total_races') THEN
    ALTER TABLE players ADD COLUMN total_races integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'total_wins') THEN
    ALTER TABLE players ADD COLUMN total_wins integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'podiums') THEN
    ALTER TABLE players ADD COLUMN podiums integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'total_prize_money') THEN
    ALTER TABLE players ADD COLUMN total_prize_money integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'best_month') THEN
    ALTER TABLE players ADD COLUMN best_month text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'color') THEN
    ALTER TABLE players ADD COLUMN color text DEFAULT '#3b82f6';
  END IF;
END $$;

-- Extend dogs table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dogs' AND column_name = 'races_participated') THEN
    ALTER TABLE dogs ADD COLUMN races_participated integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dogs' AND column_name = 'best_position') THEN
    ALTER TABLE dogs ADD COLUMN best_position integer DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dogs' AND column_name = 'worst_position') THEN
    ALTER TABLE dogs ADD COLUMN worst_position integer DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dogs' AND column_name = 'average_position') THEN
    ALTER TABLE dogs ADD COLUMN average_position decimal(5,2) DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dogs' AND column_name = 'total_prize_money') THEN
    ALTER TABLE dogs ADD COLUMN total_prize_money integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dogs' AND column_name = 'training_history') THEN
    ALTER TABLE dogs ADD COLUMN training_history jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Extend races table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'races' AND column_name = 'participants') THEN
    ALTER TABLE races ADD COLUMN participants jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'races' AND column_name = 'prize_pool') THEN
    ALTER TABLE races ADD COLUMN prize_pool jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create auctions table
CREATE TABLE IF NOT EXISTS auctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  dog_data jsonb NOT NULL,
  seller_id uuid REFERENCES players(id) ON DELETE SET NULL,
  starting_bid integer NOT NULL,
  current_bid integer NOT NULL,
  current_bidder_id uuid REFERENCES players(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  ends_at timestamptz NOT NULL
);

ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to auctions"
  ON auctions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert of auctions"
  ON auctions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update of auctions"
  ON auctions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to activity logs"
  ON activity_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert of activity logs"
  ON activity_logs FOR INSERT
  TO public
  WITH CHECK (true);

-- Create track_records table
CREATE TABLE IF NOT EXISTS track_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  track_name text NOT NULL,
  dog_id uuid NOT NULL,
  dog_name text NOT NULL,
  owner_id uuid REFERENCES players(id) ON DELETE SET NULL,
  owner_name text NOT NULL,
  time decimal(10,3) NOT NULL,
  race_id uuid REFERENCES races(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE track_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to track records"
  ON track_records FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert of track records"
  ON track_records FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_auctions_session_id ON auctions(session_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_session_id ON activity_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_player_id ON activity_logs(player_id);
CREATE INDEX IF NOT EXISTS idx_track_records_session_id ON track_records(session_id);
CREATE INDEX IF NOT EXISTS idx_track_records_track_name ON track_records(track_name);
