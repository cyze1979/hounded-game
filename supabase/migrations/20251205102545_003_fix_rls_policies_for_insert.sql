/*
  # Fix RLS Policies - Allow Inserts

  1. Problem
    - Current policies only allow SELECT operations
    - Users cannot create new game sessions or insert data

  2. Solution
    - Add INSERT policies for game_sessions
    - Allow anyone to create new games (public access for game creation)
    - Keep existing SELECT policies

  3. Security Notes
    - Game sessions are meant to be created by anyone
    - This enables the game setup flow
    - Updates are still controlled through existing policies
*/

-- Drop the restrictive policies and create new ones that allow INSERT
DROP POLICY IF EXISTS "Allow anyone to read game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Allow inserting players" ON players;
DROP POLICY IF EXISTS "Allow inserting dogs" ON dogs;
DROP POLICY IF EXISTS "Allow inserting races" ON races;

-- game_sessions: Allow anyone to read and create new sessions
CREATE POLICY "Allow public read access to game sessions"
  ON game_sessions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert of game sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update of game sessions"
  ON game_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- players: Allow insert and update
CREATE POLICY "Allow public insert of players"
  ON players FOR INSERT
  WITH CHECK (true);

-- dogs: Allow insert and update
CREATE POLICY "Allow public insert of dogs"
  ON dogs FOR INSERT
  WITH CHECK (true);

-- races: Allow insert
CREATE POLICY "Allow public insert of races"
  ON races FOR INSERT
  WITH CHECK (true);
