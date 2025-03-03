import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { generatePlayerHeatmap } from '../src/utils/statsbomb-new';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface PlayerMapping {
    fpl_id: number;
    statsbomb_id: number;
    name: string;
}

async function generateHeatmaps() {
    try {
        // Get player mappings from the database
        const { data: playerMappings, error } = await supabase
            .from('player_id_mappings')
            .select('fpl_id, statsbomb_id, name');

        if (error) {
            throw error;
        }

        if (!playerMappings || playerMappings.length === 0) {
            throw new Error('No player mappings found in the database');
        }

        console.log(`Loaded ${playerMappings.length} player mappings from database`);

        // Process each player
        for (const mapping of playerMappings as PlayerMapping[]) {
            try {
                if (!mapping.name || !mapping.statsbomb_id || !mapping.fpl_id) {
                    console.error('Invalid player mapping:', mapping);
                    continue;
                }

                console.log(`\nProcessing player ${mapping.name} (FPL ID: ${mapping.fpl_id}, StatsBomb ID: ${mapping.statsbomb_id})...`);
                const result = await generatePlayerHeatmap(mapping.statsbomb_id);
                
                if (result.totalEvents === 0) {
                    console.log(`No events found for ${mapping.name}, skipping...`);
                    continue;
                }

                // Save the heatmap data to the database
                const { error: insertError } = await supabase
                    .from('player_heatmaps')
                    .upsert({
                        player_id: mapping.fpl_id,
                        heatmap_data: result.heatmapData,
                        matches_included: result.matchesIncluded,
                        total_events: result.totalEvents,
                        last_updated: new Date().toISOString()
                    });

                if (insertError) {
                    console.error(`Error saving heatmap for ${mapping.name}:`, insertError);
                } else {
                    console.log(`Successfully saved heatmap for ${mapping.name} with ${result.totalEvents} events from ${result.matchesIncluded.length} matches`);
                }
            } catch (error) {
                console.error(`Error processing player ${mapping.name}:`, error);
            }
        }
        
        console.log('\nHeatmap generation completed');
    } catch (error) {
        console.error('Error during heatmap generation:', error);
    }
}

// Run the script
generateHeatmaps().catch(console.error); 