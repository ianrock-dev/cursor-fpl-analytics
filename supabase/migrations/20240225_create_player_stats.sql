-- Create player_stats table
CREATE TABLE IF NOT EXISTS player_stats (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  position TEXT NOT NULL,
  matches INTEGER NOT NULL DEFAULT 0,
  starts INTEGER NOT NULL DEFAULT 0,
  minutes INTEGER NOT NULL DEFAULT 0,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  xg DECIMAL(5,2) NOT NULL DEFAULT 0,
  xa DECIMAL(5,2) NOT NULL DEFAULT 0,
  progressive_carries INTEGER NOT NULL DEFAULT 0,
  progressive_passes INTEGER NOT NULL DEFAULT 0,
  shots INTEGER NOT NULL DEFAULT 0,
  shots_on_target INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on last_updated for cache invalidation queries
CREATE INDEX IF NOT EXISTS idx_player_stats_last_updated ON player_stats(last_updated);

-- Enable Row Level Security (RLS)
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read player stats
CREATE POLICY "Allow public read access to player_stats"
  ON player_stats
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow authenticated users to insert/update player stats
CREATE POLICY "Allow authenticated users to insert/update player_stats"
  ON player_stats
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true); 