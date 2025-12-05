/*
  # Fix Market Dogs RLS Policies

  1. Changes
    - Drop existing RLS policies for market_dogs that only allow authenticated users
    - Create new policies that allow public access
    - This matches the game's architecture where no authentication is required

  2. Security
    - Allow public read, insert, update, and delete access to market_dogs
    - Access is session-based, not user-based
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view market dogs" ON market_dogs;
DROP POLICY IF EXISTS "Users can insert market dogs" ON market_dogs;
DROP POLICY IF EXISTS "Users can update market dogs" ON market_dogs;
DROP POLICY IF EXISTS "Users can delete market dogs" ON market_dogs;

-- Create new public policies
CREATE POLICY "Allow public read access to market dogs"
  ON market_dogs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert of market dogs"
  ON market_dogs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update of market dogs"
  ON market_dogs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete of market dogs"
  ON market_dogs FOR DELETE
  TO public
  USING (true);
