"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const player_id_mapping_1 = require("../../../../utils/player-id-mapping");
const statsbomb_heatmap_cache_1 = require("../../../../utils/statsbomb-heatmap-cache");
const statsbomb_heatmap_generator_1 = require("../../../../utils/statsbomb-heatmap-generator");
/**
 * GET handler for player heatmap data
 */
async function GET(request) {
    try {
        // Get player ID from query parameters
        const searchParams = request.nextUrl.searchParams;
        const playerIdParam = searchParams.get('playerId');
        if (!playerIdParam) {
            return server_1.NextResponse.json({ error: 'Missing playerId parameter' }, { status: 400 });
        }
        const playerId = parseInt(playerIdParam, 10);
        if (isNaN(playerId)) {
            return server_1.NextResponse.json({ error: 'Invalid playerId parameter' }, { status: 400 });
        }
        // Try to get heatmap data
        let heatmapData = null;
        let isRealData = false;
        try {
            // Step 1: Try to get data from database (fastest)
            console.log(`Attempting to get heatmap data from database for player ${playerId}`);
            heatmapData = await (0, statsbomb_heatmap_cache_1.getHeatmapFromDatabase)(playerId);
            if (heatmapData) {
                isRealData = true;
                console.log(`Successfully retrieved heatmap data from database for player ${playerId}`);
            }
            else {
                // Step 2: Map FPL player ID to StatsBomb player ID
                console.log(`Attempting to get real data for FPL player ${playerId}`);
                const statsBombPlayerId = await (0, player_id_mapping_1.mapFplToStatsBombPlayerId)(playerId);
                if (!statsBombPlayerId) {
                    console.warn(`No StatsBomb ID mapping found for FPL player ${playerId}`);
                    throw new Error(`No StatsBomb ID mapping found for player ${playerId}`);
                }
                console.log(`Mapped FPL player ${playerId} to StatsBomb ID ${statsBombPlayerId}`);
                // Step 3: Try to get data from file cache
                heatmapData = (0, statsbomb_heatmap_cache_1.getHeatmapFromCache)(statsBombPlayerId);
                if (heatmapData) {
                    isRealData = true;
                    console.log(`Using cached heatmap data for player ${statsBombPlayerId}`);
                    // Save to database for faster access next time
                    await (0, statsbomb_heatmap_cache_1.saveHeatmapToDatabase)(playerId, statsBombPlayerId, heatmapData);
                }
                else {
                    // Step 4: Generate new heatmap data
                    console.log(`Generating new heatmap data for player ${statsBombPlayerId}`);
                    const result = await (0, statsbomb_heatmap_generator_1.generateHeatmapForPlayer)(statsBombPlayerId);
                    if (result && result.heatmapData.length > 0) {
                        heatmapData = result.heatmapData;
                        isRealData = true;
                        // Save to cache and database
                        (0, statsbomb_heatmap_cache_1.saveHeatmapToCache)(playerId, statsBombPlayerId, result.heatmapData, result.matchesIncluded, result.totalEvents);
                        await (0, statsbomb_heatmap_cache_1.saveHeatmapToDatabase)(playerId, statsBombPlayerId, result.heatmapData);
                        console.log(`Successfully generated and cached heatmap for player ${statsBombPlayerId}`);
                    }
                    else {
                        throw new Error(`Failed to generate heatmap for player ${statsBombPlayerId}`);
                    }
                }
                console.log(`Successfully retrieved real data for player ${playerId}`);
            }
        }
        catch (error) {
            console.error(`Error getting real data for player ${playerId}:`, error);
            console.log(`No real StatsBomb data found for player ID ${playerId}, using placeholder`);
            // Use placeholder data as fallback
            heatmapData = (0, statsbomb_heatmap_generator_1.generatePlaceholderHeatmap)();
            isRealData = false;
        }
        // Return the heatmap data
        return server_1.NextResponse.json({
            playerId,
            heatmap: heatmapData,
            isRealData
        });
    }
    catch (error) {
        console.error('Error in player heatmap API:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
