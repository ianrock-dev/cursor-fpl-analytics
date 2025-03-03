-- Create player_bios table
CREATE TABLE IF NOT EXISTS public.player_bios (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR NOT NULL,
    full_name VARCHAR,
    birth_date VARCHAR,
    birth_place VARCHAR,
    nationality VARCHAR,
    height VARCHAR,
    weight VARCHAR,
    position VARCHAR,
    foot VARCHAR,
    current_club VARCHAR,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_name)
);

-- Grant access to authenticated users
ALTER TABLE public.player_bios ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read
CREATE POLICY "Allow public read access"
    ON public.player_bios
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow service role to insert/update
CREATE POLICY "Allow service role to insert/update"
    ON public.player_bios
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true); 