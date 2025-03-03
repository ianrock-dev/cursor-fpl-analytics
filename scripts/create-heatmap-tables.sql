-- Create player_id_mappings table
CREATE TABLE IF NOT EXISTS player_id_mappings (
  id SERIAL PRIMARY KEY,
  fpl_id INTEGER NOT NULL UNIQUE,
  statsbomb_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on fpl_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_player_id_mappings_fpl_id ON player_id_mappings(fpl_id);
CREATE INDEX IF NOT EXISTS idx_player_id_mappings_statsbomb_id ON player_id_mappings(statsbomb_id);

-- Create player_heatmaps table
CREATE TABLE IF NOT EXISTS player_heatmaps (
    player_id INTEGER PRIMARY KEY,
    heatmap_data JSONB NOT NULL,
    matches_included INTEGER[] NOT NULL,
    total_events INTEGER NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_player_heatmaps_last_updated ON player_heatmaps(last_updated);

-- Grant access to authenticated users
ALTER TABLE player_heatmaps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to authenticated users
CREATE POLICY player_heatmaps_select_policy ON player_heatmaps
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow insert/update access to authenticated users
CREATE POLICY player_heatmaps_insert_policy ON player_heatmaps
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY player_heatmaps_update_policy ON player_heatmaps
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at column
CREATE TRIGGER update_player_id_mappings_updated_at
BEFORE UPDATE ON player_id_mappings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to update the last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the last_updated column
CREATE TRIGGER update_player_heatmaps_last_updated
BEFORE UPDATE ON player_heatmaps
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();

-- Add sample data for testing (optional)
INSERT INTO player_id_mappings (fpl_id, statsbomb_id, name)
VALUES 
  (427, 10001, 'Mohamed Salah'),
  (182, 10002, 'Kevin De Bruyne'),
  (283, 10003, 'Bruno Fernandes'),
  (357, 10004, 'Harry Kane'),
  (233, 10005, 'Erling Haaland')
ON CONFLICT (fpl_id) DO NOTHING; 