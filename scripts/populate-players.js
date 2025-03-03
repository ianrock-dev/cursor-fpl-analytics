const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Football Data API configuration
const FOOTBALL_API_BASE_URL = 'https://api.football-data.org/v4';
const FOOTBALL_API_KEY = process.env.FOOTBALL_DATA_API_KEY;

// List of major competition IDs to fetch players from
const COMPETITION_IDS = [
  2021, // Premier League
  2014, // La Liga
  2019, // Serie A
  2002, // Bundesliga
  2015, // Ligue 1
  2001  // Champions League
];

async function fetchCompetitionInfo(competitionId) {
  const response = await fetch(
    `${FOOTBALL_API_BASE_URL}/competitions/${competitionId}`,
    {
      headers: {
        'X-Auth-Token': FOOTBALL_API_KEY
      }
    }
  );
  return await response.json();
}

async function fetchTeamsForCompetition(competitionId) {
  const response = await fetch(
    `${FOOTBALL_API_BASE_URL}/competitions/${competitionId}/teams`,
    {
      headers: {
        'X-Auth-Token': FOOTBALL_API_KEY
      }
    }
  );
  const data = await response.json();
  return data.teams || [];
}

async function fetchTeamPlayers(teamId) {
  const response = await fetch(
    `${FOOTBALL_API_BASE_URL}/teams/${teamId}`,
    {
      headers: {
        'X-Auth-Token': FOOTBALL_API_KEY
      }
    }
  );
  const data = await response.json();
  return data.squad || [];
}

async function upsertCompetition(competition) {
  const { error } = await supabase
    .from('competitions')
    .upsert({
      id: competition.id,
      name: competition.name,
      code: competition.code,
      country: competition.area?.name,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error(`Error upserting competition ${competition.name}:`, error);
  }
}

async function upsertTeam(team) {
  const { error } = await supabase
    .from('teams')
    .upsert({
      id: team.id,
      name: team.name,
      short_name: team.shortName,
      tla: team.tla,
      crest_url: team.crest,
      venue: team.venue,
      founded: team.founded,
      club_colors: team.clubColors,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error(`Error upserting team ${team.name}:`, error);
  }
}

async function upsertPlayer(player) {
  const { error } = await supabase
    .from('players')
    .upsert({
      id: player.id,
      name: player.name,
      first_name: player.firstName,
      last_name: player.lastName,
      date_of_birth: player.dateOfBirth,
      nationality: player.nationality,
      position: player.position,
      shirt_number: player.shirtNumber,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error(`Error upserting player ${player.name}:`, error);
  }
}

async function upsertTeamCompetition(teamId, competitionId, season) {
  const { error } = await supabase
    .from('team_competitions')
    .upsert({
      team_id: teamId,
      competition_id: competitionId,
      season: season
    });

  if (error) {
    console.error(`Error upserting team_competition relation:`, error);
  }
}

async function upsertPlayerTeam(playerId, teamId) {
  const { error } = await supabase
    .from('player_teams')
    .upsert({
      player_id: playerId,
      team_id: teamId,
      start_date: new Date().toISOString().split('T')[0], // Current date as start_date
      end_date: null // Still active
    });

  if (error) {
    console.error(`Error upserting player_team relation:`, error);
  }
}

async function populateDatabase() {
  try {
    console.log('Starting database population...');
    const currentSeason = new Date().getFullYear().toString();

    for (const competitionId of COMPETITION_IDS) {
      console.log(`Processing competition ${competitionId}...`);
      
      // Fetch and store competition info
      const competition = await fetchCompetitionInfo(competitionId);
      await upsertCompetition(competition);
      
      // Fetch and store teams
      const teams = await fetchTeamsForCompetition(competitionId);
      for (const team of teams) {
        await upsertTeam(team);
        await upsertTeamCompetition(team.id, competitionId, currentSeason);
        
        // Fetch and store players
        console.log(`Fetching players for team ${team.name}...`);
        const players = await fetchTeamPlayers(team.id);
        
        for (const player of players) {
          await upsertPlayer(player);
          await upsertPlayerTeam(player.id, team.id);
          
          // Add delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    console.log('Database population completed successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

// Run the population script
populateDatabase(); 