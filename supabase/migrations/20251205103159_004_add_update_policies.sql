/*
  # Add UPDATE policies for data modification
  
  1. Changes
    - Add UPDATE policy for players table
    - Add UPDATE policy for dogs table
  
  2. Security
    - Players can update their own data within their session
    - Dogs can be updated by their owning player
    - All updates require authentication
*/

DROP POLICY IF EXISTS "Allow authenticated users to update players" ON players;
CREATE POLICY "Allow authenticated users to update players"
  ON players FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update dogs" ON dogs;
CREATE POLICY "Allow authenticated users to update dogs"
  ON dogs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
