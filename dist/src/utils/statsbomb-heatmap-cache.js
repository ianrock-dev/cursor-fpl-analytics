"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCacheValid = isCacheValid;
exports.getHeatmapFromCache = getHeatmapFromCache;
exports.saveHeatmapToCache = saveHeatmapToCache;
exports.saveHeatmapToDatabase = saveHeatmapToDatabase;
exports.getHeatmapFromDatabase = getHeatmapFromDatabase;
exports.invalidateCache = invalidateCache;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const supabase_client_1 = require("./supabase-client");
const CACHE_DIR = path_1.default.join(process.cwd(), 'data', 'statsbomb', 'heatmaps');
const CACHE_EXPIRY_DAYS = 7; // Cache expires after 7 days
/**
 * Ensures the cache directory exists
 */
function ensureCacheDir() {
    if (!fs_1.default.existsSync(CACHE_DIR)) {
        fs_1.default.mkdirSync(CACHE_DIR, { recursive: true });
    }
}
/**
 * Gets the path to the cache file for a player
 */
function getCacheFilePath(statsBombPlayerId) {
    return path_1.default.join(CACHE_DIR, `${statsBombPlayerId}.json`);
}
/**
 * Checks if a cache file exists and is not expired
 */
function isCacheValid(statsBombPlayerId) {
    const cacheFilePath = getCacheFilePath(statsBombPlayerId);
    if (!fs_1.default.existsSync(cacheFilePath)) {
        return false;
    }
    try {
        const cacheData = JSON.parse(fs_1.default.readFileSync(cacheFilePath, 'utf-8'));
        const lastUpdated = new Date(cacheData.lastUpdated);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays < CACHE_EXPIRY_DAYS;
    }
    catch (error) {
        console.error(`Error reading cache for player ${statsBombPlayerId}:`, error);
        return false;
    }
}
/**
 * Gets heatmap data from cache
 */
function getHeatmapFromCache(statsBombPlayerId) {
    if (!isCacheValid(statsBombPlayerId)) {
        return null;
    }
    try {
        const cacheFilePath = getCacheFilePath(statsBombPlayerId);
        const cacheData = JSON.parse(fs_1.default.readFileSync(cacheFilePath, 'utf-8'));
        console.log(`Using cached heatmap data for player ${statsBombPlayerId}`);
        return cacheData.data;
    }
    catch (error) {
        console.error(`Error reading cache for player ${statsBombPlayerId}:`, error);
        return null;
    }
}
/**
 * Saves heatmap data to cache
 */
function saveHeatmapToCache(fplPlayerId, statsBombPlayerId, heatmapData, matchesIncluded, totalEvents) {
    ensureCacheDir();
    const cacheData = {
        playerId: fplPlayerId,
        statsBombId: statsBombPlayerId,
        lastUpdated: new Date().toISOString(),
        data: heatmapData,
        matchesIncluded,
        totalEvents
    };
    try {
        const cacheFilePath = getCacheFilePath(statsBombPlayerId);
        fs_1.default.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2));
        console.log(`Cached heatmap data for player ${statsBombPlayerId}`);
    }
    catch (error) {
        console.error(`Error caching data for player ${statsBombPlayerId}:`, error);
    }
}
/**
 * Saves heatmap data to Supabase for faster access
 */
async function saveHeatmapToDatabase(fplPlayerId, statsBombPlayerId, heatmapData) {
    try {
        const { error } = await supabase_client_1.supabase
            .from('player_heatmaps')
            .upsert({
            fpl_player_id: fplPlayerId,
            statsbomb_player_id: statsBombPlayerId,
            heatmap_data: heatmapData,
            last_updated: new Date().toISOString()
        }, {
            onConflict: 'fpl_player_id'
        });
        if (error) {
            throw error;
        }
        console.log(`Saved heatmap data to database for player ${fplPlayerId}`);
    }
    catch (error) {
        console.error(`Error saving heatmap to database for player ${fplPlayerId}:`, error);
    }
}
/**
 * Gets heatmap data from Supabase
 */
async function getHeatmapFromDatabase(fplPlayerId) {
    try {
        const { data, error } = await supabase_client_1.supabase
            .from('player_heatmaps')
            .select('heatmap_data, last_updated')
            .eq('fpl_player_id', fplPlayerId)
            .single();
        if (error) {
            throw error;
        }
        if (!data) {
            return null;
        }
        // Check if data is expired
        const lastUpdated = new Date(data.last_updated);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays >= CACHE_EXPIRY_DAYS) {
            return null;
        }
        console.log(`Retrieved heatmap data from database for player ${fplPlayerId}`);
        return data.heatmap_data;
    }
    catch (error) {
        console.error(`Error getting heatmap from database for player ${fplPlayerId}:`, error);
        return null;
    }
}
/**
 * Invalidates the cache for a player
 */
function invalidateCache(statsBombPlayerId) {
    const cacheFilePath = getCacheFilePath(statsBombPlayerId);
    if (fs_1.default.existsSync(cacheFilePath)) {
        try {
            fs_1.default.unlinkSync(cacheFilePath);
            console.log(`Invalidated cache for player ${statsBombPlayerId}`);
        }
        catch (error) {
            console.error(`Error invalidating cache for player ${statsBombPlayerId}:`, error);
        }
    }
}
