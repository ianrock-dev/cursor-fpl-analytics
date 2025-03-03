-- Create player_bios table
CREATE TABLE IF NOT EXISTS player_bios (
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