/*
  # Add XP and Level System

  1. Changes to Dogs Table
    - Add `level` (integer, default 1) - Dog's current level
    - Add `xp` (integer, default 0) - Current experience points
    - Add `available_points` (integer, default 0) - Unspent attribute points from level ups
    - Remove `last_trained_month` (deprecated - training system removed)
    - Remove `training_history` (deprecated - training system removed)

  2. Migration Notes
    - All existing dogs will be initialized with level=1, xp=0, available_points=0
    - Training-related columns are kept for backward compatibility but can be dropped in future cleanup
    - XP is gained through race participation (position-based rewards)
    - Level ups grant attribute points that can be spent on speed/stamina/acceleration/focus

  3. Security
    - No RLS changes needed (inherits from dogs table)
*/

-- Add XP/Level columns to dogs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dogs' AND column_name = 'level'
  ) THEN
    ALTER TABLE dogs ADD COLUMN level integer DEFAULT 1 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dogs' AND column_name = 'xp'
  ) THEN
    ALTER TABLE dogs ADD COLUMN xp integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dogs' AND column_name = 'available_points'
  ) THEN
    ALTER TABLE dogs ADD COLUMN available_points integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Initialize existing dogs with default XP/Level values
UPDATE dogs
SET
  level = 1,
  xp = 0,
  available_points = 0
WHERE level IS NULL OR xp IS NULL OR available_points IS NULL;