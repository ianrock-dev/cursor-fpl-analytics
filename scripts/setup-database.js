const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setupDatabase() {
  try {
    // Create competitions table
    const { error: competitionsError } = await supabase.rpc('create_competitions_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS competitions (
          id INTEGER PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(10),
          country VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
        
        CREATE INDEX IF NOT EXISTS idx_competitions_code ON competitions(code);
      `
    });
    
    if (competitionsError) throw competitionsError;

    // Create teams table
    const { error: teamsError } = await supabase.rpc('create_teams_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS teams (
          id INTEGER PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          short_name VARCHAR(100),
          tla VARCHAR(3),
          crest_url TEXT,
          venue VARCHAR(255),
          founded INTEGER,
          club_colors VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
        
        CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
      `
    });
    
    if (teamsError) throw teamsError;

    // Create players table
    const { error: playersError } = await supabase.rpc('create_players_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS players (
          id INTEGER PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          date_of_birth DATE,
          nationality VARCHAR(100),
          position VARCHAR(50),
          shirt_number INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
        
        CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
        CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
      `
    });
    
    if (playersError) throw playersError;

    // Create team_competitions table (for managing team participation in competitions)
    const { error: teamCompError } = await supabase.rpc('create_team_competitions_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS team_competitions (
          team_id INTEGER REFERENCES teams(id),
          competition_id INTEGER REFERENCES competitions(id),
          season VARCHAR(9),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          PRIMARY KEY (team_id, competition_id, season)
        );
        
        CREATE INDEX IF NOT EXISTS idx_team_competitions_season ON team_competitions(season);
      `
    });
    
    if (teamCompError) throw teamCompError;

    // Create player_teams table (for managing player transfers and team history)
    const { error: playerTeamsError } = await supabase.rpc('create_player_teams_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS player_teams (
          player_id INTEGER REFERENCES players(id),
          team_id INTEGER REFERENCES teams(id),
          start_date DATE,
          end_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          PRIMARY KEY (player_id, team_id, start_date)
        );
        
        CREATE INDEX IF NOT EXISTS idx_player_teams_dates ON player_teams(start_date, end_date);
      `
    });
    
    if (playerTeamsError) throw playerTeamsError;

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase(); 