-- Create player_summaries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.player_summaries (
  player_id INTEGER PRIMARY KEY,
  summary_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.player_summaries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated and anonymous users
CREATE POLICY "Allow all operations for all users" ON public.player_summaries
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Fix RLS policies for players table
CREATE POLICY "Allow all operations for all users" ON public.players
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Fix RLS policies for all_players table
CREATE POLICY "Allow all operations for all users" ON public.all_players
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Grant permissions to anon role
GRANT ALL ON public.players TO anon;
GRANT ALL ON public.player_summaries TO anon;
GRANT ALL ON public.all_players TO anon; 