"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.getPlayerFromCache = getPlayerFromCache;
exports.cachePlayer = cachePlayer;
exports.getPlayerSummaryFromCache = getPlayerSummaryFromCache;
exports.cachePlayerSummary = cachePlayerSummary;
exports.getAllPlayersFromCache = getAllPlayersFromCache;
exports.cacheAllPlayers = cacheAllPlayers;
const supabase_js_1 = require("@supabase/supabase-js");
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// Log Supabase configuration (without exposing the full key)
console.log('Supabase URL configured:', !!supabaseUrl);
console.log('Supabase Key configured:', !!supabaseAnonKey && supabaseAnonKey.length > 0);
// Create a single supabase client for interacting with your database
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
// Player data functions
async function getPlayerFromCache(playerId) {
    console.log(`Attempting to get player ${playerId} from cache`);
    try {
        const { data, error } = await exports.supabase
            .from('players')
            .select('*')
            .eq('id', playerId)
            .single();
        if (error) {
            console.error('Error fetching player from cache:', error);
            return null;
        }
        console.log(`Successfully retrieved player ${playerId} from cache`);
        return data;
    }
    catch (err) {
        console.error('Exception in getPlayerFromCache:', err);
        return null;
    }
}
async function cachePlayer(player) {
    console.log(`Attempting to cache player ${player.id}`);
    try {
        const { error } = await exports.supabase
            .from('players')
            .upsert({
            id: player.id,
            data: player,
            last_updated: new Date().toISOString()
        }, { onConflict: 'id' });
        if (error) {
            console.error('Error caching player:', error);
        }
        else {
            console.log(`Successfully cached player ${player.id}`);
        }
    }
    catch (err) {
        console.error('Exception in cachePlayer:', err);
    }
}
// Summary data functions
async function getPlayerSummaryFromCache(playerId) {
    console.log(`Attempting to get summary for player ${playerId} from cache`);
    try {
        const { data, error } = await exports.supabase
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
    }
    catch (err) {
        console.error('Exception in getPlayerSummaryFromCache:', err);
        return null;
    }
}
async function cachePlayerSummary(playerId, summaryData) {
    console.log(`Attempting to cache summary for player ${playerId}`);
    try {
        const { error } = await exports.supabase
            .from('player_summaries')
            .upsert({
            player_id: playerId,
            summary_data: summaryData,
            last_updated: new Date().toISOString()
        }, { onConflict: 'player_id' });
        if (error) {
            console.error('Error caching player summary:', error);
        }
        else {
            console.log(`Successfully cached summary for player ${playerId}`);
        }
    }
    catch (err) {
        console.error('Exception in cachePlayerSummary:', err);
    }
}
// All players data functions
async function getAllPlayersFromCache() {
    console.log('Attempting to get all players from cache');
    try {
        const { data, error } = await exports.supabase
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
    }
    catch (err) {
        console.error('Exception in getAllPlayersFromCache:', err);
        return null;
    }
}
async function cacheAllPlayers(playersData) {
    console.log('Attempting to cache all players data');
    try {
        const { error } = await exports.supabase
            .from('all_players')
            .upsert({
            id: 1, // We only need one row in this table
            players_data: playersData,
            last_updated: new Date().toISOString()
        }, { onConflict: 'id' });
        if (error) {
            console.error('Error caching all players:', error);
        }
        else {
            console.log('Successfully cached all players data');
        }
    }
    catch (err) {
        console.error('Exception in cacheAllPlayers:', err);
    }
}
