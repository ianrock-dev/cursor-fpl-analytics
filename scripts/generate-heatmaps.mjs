import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { supabase } from '../src/utils/supabase.ts';
import { getAllPlayerIdMappings } from '../src/utils/player-id-mapping.ts';
import { saveHeatmapToCache, saveHeatmapToDatabase } from '../src/utils/statsbomb-heatmap-cache.ts';
import { generateHeatmapForPlayer } from '../src/utils/statsbomb-heatmap-generator.ts';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function generateAllHeatmaps() {
    console.log('Starting heatmap generation for all players...');
    
    try {
        // Get all player ID mappings
        const playerMappings = await getAllPlayerIdMappings();
        console.log(`Found ${playerMappings.length} player mappings`);
        
        let successCount = 0;
        let failureCount = 0;
        
        // Process each player
        for (const mapping of playerMappings) {
            try {
                console.log(`Generating heatmap for player ${mapping.fpl_id} (StatsBomb ID: ${mapping.statsbomb_id})`);
                
                // Generate heatmap
                const heatmapData = await generateHeatmapForPlayer(mapping.statsbomb_id);
                
                if (heatmapData) {
                    // Save to cache
                    await saveHeatmapToCache(mapping.fpl_id, heatmapData);
                    
                    // Save to database
                    await saveHeatmapToDatabase(mapping.fpl_id, mapping.statsbomb_id, heatmapData);
                    
                    successCount++;
                    console.log(`Successfully generated and saved heatmap for player ${mapping.fpl_id}`);
                } else {
                    failureCount++;
                    console.log(`No heatmap data generated for player ${mapping.fpl_id}`);
                }
            } catch (error) {
                failureCount++;
                console.error(`Error processing player ${mapping.fpl_id}:`, error);
            }
        }
        
        console.log(`Heatmap generation completed.`);
        console.log(`Successes: ${successCount}`);
        console.log(`Failures: ${failureCount}`);
        
    } catch (error) {
        console.error('Error in heatmap generation:', error);
        process.exit(1);
    }
}

// Run the script
generateAllHeatmaps(); 