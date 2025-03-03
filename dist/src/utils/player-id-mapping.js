"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlayerIdMappings = loadPlayerIdMappings;
exports.mapFplToStatsBombPlayerId = mapFplToStatsBombPlayerId;
exports.mapStatsBombToFplPlayerId = mapStatsBombToFplPlayerId;
exports.addPlayerIdMapping = addPlayerIdMapping;
exports.getAllPlayerIdMappings = getAllPlayerIdMappings;
const supabase_1 = require("./supabase");
// Cache for player ID mappings
let playerIdMappingsCache = null;
/**
 * Loads player ID mappings from Supabase
 */
async function loadPlayerIdMappings() {
    if (playerIdMappingsCache) {
        return playerIdMappingsCache;
    }
    try {
        const { data, error } = await supabase_1.supabase
            .from('player_id_mappings')
            .select('fpl_id, statsbomb_id, name');
        if (error) {
            throw error;
        }
        if (!data || data.length === 0) {
            console.warn('No player ID mappings found in database');
            return [];
        }
        // Transform the data to match our interface
        const mappings = data.map(item => ({
            fplId: item.fpl_id,
            statsBombId: item.statsbomb_id,
            name: item.name
        }));
        playerIdMappingsCache = mappings;
        console.log(`Loaded ${mappings.length} player ID mappings from database`);
        return mappings;
    }
    catch (error) {
        console.error('Error loading player ID mappings:', error);
        return [];
    }
}
/**
 * Maps an FPL player ID to a StatsBomb player ID
 */
async function mapFplToStatsBombPlayerId(fplPlayerId) {
    const mappings = await loadPlayerIdMappings();
    const mapping = mappings.find(m => m.fplId === fplPlayerId);
    if (!mapping) {
        console.warn(`No StatsBomb ID mapping found for FPL player ID ${fplPlayerId}`);
        return null;
    }
    return mapping.statsBombId;
}
/**
 * Maps a StatsBomb player ID to an FPL player ID
 */
async function mapStatsBombToFplPlayerId(statsBombPlayerId) {
    const mappings = await loadPlayerIdMappings();
    const mapping = mappings.find(m => m.statsBombId === statsBombPlayerId);
    if (!mapping) {
        console.warn(`No FPL ID mapping found for StatsBomb player ID ${statsBombPlayerId}`);
        return null;
    }
    return mapping.fplId;
}
/**
 * Adds a new player ID mapping
 */
async function addPlayerIdMapping(fplPlayerId, statsBombPlayerId, playerName) {
    try {
        const { error } = await supabase_1.supabase
            .from('player_id_mappings')
            .upsert({
            fpl_id: fplPlayerId,
            statsbomb_id: statsBombPlayerId,
            name: playerName
        }, {
            onConflict: 'fpl_id'
        });
        if (error) {
            throw error;
        }
        // Invalidate cache
        playerIdMappingsCache = null;
        console.log(`Added player ID mapping: FPL ID ${fplPlayerId} -> StatsBomb ID ${statsBombPlayerId} (${playerName})`);
        return true;
    }
    catch (error) {
        console.error('Error adding player ID mapping:', error);
        return false;
    }
}
/**
 * Gets all player ID mappings
 */
async function getAllPlayerIdMappings() {
    return loadPlayerIdMappings();
}
