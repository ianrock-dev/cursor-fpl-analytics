import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log Supabase configuration (without exposing the full key)
console.log('Supabase URL configured:', !!supabaseUrl);
console.log('Supabase Key configured:', !!supabaseAnonKey && supabaseAnonKey.length > 0);

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Player data functions
export async function getPlayerFromCache(playerId: number) {
  console.log(`Attempting to get player ${playerId} from cache`);
  try {
    const { data, error } = await supabase
      .from('players')
      .select('data')
      .eq('id', playerId)
      .single();
    
    if (error) {
      console.error('Error fetching player from cache:', error);
      return null;
    }
    
    console.log(`Successfully retrieved player ${playerId} from cache:`, data?.data);
    return data?.data || null;
  } catch (err) {
    console.error('Exception in getPlayerFromCache:', err);
    return null;
  }
}

export async function cachePlayer(player: any) {
  console.log(`Attempting to cache player ${player.id}`);
  try {
    const { error } = await supabase
      .from('players')
      .upsert(
        { 
          id: player.id,
          data: player,
          last_updated: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
    
    if (error) {
      console.error('Error caching player:', error);
    } else {
      console.log(`Successfully cached player ${player.id}`);
    }
  } catch (err) {
    console.error('Exception in cachePlayer:', err);
  }
}

// Summary data functions
export async function getPlayerSummaryFromCache(playerId: number) {
  console.log(`Attempting to get summary for player ${playerId} from cache`);
  try {
    const { data, error } = await supabase
      .from('player_summaries')
      .select('*')
      .eq('player_id', playerId)
      .single();
    
    if (error) {
      console.error('Error fetching player summary from cache:', error);
      return null;
    }
    
    // If the data is more than 12 hours old, consider it stale
    const lastUpdated = new Date(data.last_updated);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate > 12) {
      console.log(`Cache for player ${playerId} is stale (${hoursSinceUpdate.toFixed(2)} hours old)`);
      return null; // Data is stale, force a refresh
    }
    
    console.log(`Successfully retrieved summary for player ${playerId} from cache`);
    return data.summary_data;
  } catch (err) {
    console.error('Exception in getPlayerSummaryFromCache:', err);
    return null;
  }
}

export async function cachePlayerSummary(playerId: number, summaryData: any) {
  console.log(`Attempting to cache summary for player ${playerId}`);
  try {
    const { error } = await supabase
      .from('player_summaries')
      .upsert(
        { 
          player_id: playerId,
          summary_data: summaryData,
          last_updated: new Date().toISOString()
        },
        { onConflict: 'player_id' }
      );
    
    if (error) {
      console.error('Error caching player summary:', error);
    } else {
      console.log(`Successfully cached summary for player ${playerId}`);
    }
  } catch (err) {
    console.error('Exception in cachePlayerSummary:', err);
  }
}

// All players data functions
export async function getAllPlayersFromCache() {
  console.log('Attempting to get all players from cache');
  try {
    const { data, error } = await supabase
      .from('all_players')
      .select('*')
      .order('id', { ascending: true })
      .single();
    
    if (error) {
      console.error('Error fetching all players from cache:', error);
      return null;
    }
    
    // If the data is more than 6 hours old, consider it stale
    const lastUpdated = new Date(data.last_updated);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate > 6) {
      console.log(`All players cache is stale (${hoursSinceUpdate.toFixed(2)} hours old)`);
      return null; // Data is stale, force a refresh
    }
    
    console.log('Successfully retrieved all players from cache');
    return data.players_data;
  } catch (err) {
    console.error('Exception in getAllPlayersFromCache:', err);
    return null;
  }
}

export async function cacheAllPlayers(playersData: any) {
  console.log('Attempting to cache all players data');
  try {
    const { error } = await supabase
      .from('all_players')
      .upsert(
        { 
          id: 1, // We only need one row in this table
          players_data: playersData,
          last_updated: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
    
    if (error) {
      console.error('Error caching all players:', error);
    } else {
      console.log('Successfully cached all players data');
    }
  } catch (err) {
    console.error('Exception in cacheAllPlayers:', err);
  }
} 