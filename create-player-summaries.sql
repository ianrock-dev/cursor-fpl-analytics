-- Create player_summaries table
CREATE TABLE IF NOT EXISTS public.player_summaries (
  player_id BIGINT PRIMARY KEY,
  summary_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.player_summaries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
DROP POLICY IF EXISTS "Allow all operations for all users" ON public.player_summaries;
CREATE POLICY "Allow all operations for all users" ON public.player_summaries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions to anon role
GRANT ALL ON public.player_summaries TO anon;
GRANT USAGE ON SEQUENCE player_summaries_player_id_seq TO anon; 