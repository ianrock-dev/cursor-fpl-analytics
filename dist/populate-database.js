"use strict";
// Script to populate Supabase database with player data
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
console.log('Supabase URL configured:', !!supabaseUrl);
console.log('Supabase Key configured:', !!supabaseAnonKey && supabaseAnonKey.length > 0);
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials are missing in .env.local file');
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function fetchFPLData() {
    console.log('Fetching data from FPL API...');
    try {
        const response = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
            },
            timeout: 10000,
        });
        if (response.status !== 200) {
            throw new Error(`Error fetching data: ${response.status}`);
        }
        return response.data;
    }
    catch (error) {
        console.error('Error fetching FPL data:', error.message);
        throw error;
    }
}
async function clearTables() {
    console.log('Clearing existing data from tables...');
    try {
        // Clear all_players table
        const { error: allPlayersError } = await supabase
            .from('all_players')
            .delete()
            .neq('id', 0); // Delete all rows
        if (allPlayersError) {
            console.error('Error clearing all_players table:', allPlayersError);
        }
        else {
            console.log('✅ Cleared all_players table');
        }
        // Clear players table
        const { error: playersError } = await supabase
            .from('players')
            .delete()
            .neq('id', 0); // Delete all rows
        if (playersError) {
            console.error('Error clearing players table:', playersError);
        }
        else {
            console.log('✅ Cleared players table');
        }
        // Clear player_summaries table
        const { error: summariesError } = await supabase
            .from('player_summaries')
            .delete()
            .neq('player_id', 0); // Delete all rows
        if (summariesError) {
            console.error('Error clearing player_summaries table:', summariesError);
        }
        else {
            console.log('✅ Cleared player_summaries table');
        }
    }
    catch (err) {
        console.error('Error clearing tables:', err);
    }
}
async function populateDatabase() {
    try {
        // Clear existing data
        await clearTables();
        // Fetch data from FPL API
        const data = await fetchFPLData();
        // Cache the entire bootstrap static data
        console.log('Caching bootstrap static data...');
        const { error: allPlayersError } = await supabase
            .from('all_players')
            .upsert({
            id: 1, // We only need one row in this table
            players_data: data,
            last_updated: new Date().toISOString()
        }, { onConflict: 'id' });
        if (allPlayersError) {
            console.error('Error caching all players:', allPlayersError);
        }
        else {
            console.log('✅ Successfully cached bootstrap static data');
        }
        // Cache individual player data
        if (data.elements && Array.isArray(data.elements)) {
            console.log(`Caching ${data.elements.length} individual players...`);
            // Process players in batches to avoid overwhelming the database
            const batchSize = 50;
            const totalPlayers = data.elements.length;
            let processedCount = 0;
            for (let i = 0; i < totalPlayers; i += batchSize) {
                const batch = data.elements.slice(i, i + batchSize);
                const playerBatch = batch.map(player => ({
                    id: player.id,
                    data: player,
                    last_updated: new Date().toISOString()
                }));
                const { error: batchError } = await supabase
                    .from('players')
                    .upsert(playerBatch, { onConflict: 'id' });
                if (batchError) {
                    console.error(`Error caching players batch ${i}-${i + batch.length}:`, batchError);
                }
                else {
                    processedCount += batch.length;
                    console.log(`✅ Cached players ${i + 1}-${i + batch.length} (${processedCount}/${totalPlayers})`);
                }
                // Add a small delay between batches to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            console.log(`✅ Successfully cached ${processedCount} individual players`);
        }
        console.log('Database population completed successfully!');
    }
    catch (error) {
        console.error('Error populating database:', error);
    }
}
// Run the population script
populateDatabase();
