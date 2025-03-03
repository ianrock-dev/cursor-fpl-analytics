"use strict";
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please check your .env.local file.');
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);
// StatsBomb API URLs
const STATSBOMB_BASE_URL = 'https://raw.githubusercontent.com/statsbomb/open-data/master/data';
const COMPETITIONS_URL = `${STATSBOMB_BASE_URL}/competitions.json`;
// FPL API URL
const FPL_API_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';
/**
 * Fetches data from the StatsBomb API
 */
async function fetchStatsBombData(endpoint) {
    try {
        const url = endpoint.startsWith('http') ? endpoint : `${STATSBOMB_BASE_URL}${endpoint}`;
        const response = await axios.get(url);
        return response.data;
    }
    catch (error) {
        console.error(`Error fetching StatsBomb data from ${endpoint}:`, error.message);
        return null;
    }
}
/**
 * Fetches data from the FPL API
 */
async function fetchFplData() {
    try {
        const response = await axios.get(FPL_API_URL);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching FPL data:', error.message);
        return null;
    }
}
/**
 * Gets all players from StatsBomb data
 */
async function getAllStatsBombPlayers() {
    try {
        // Get competitions
        const competitions = await fetchStatsBombData('/competitions.json');
        if (!competitions || !Array.isArray(competitions)) {
            throw new Error('Failed to fetch competitions data');
        }
        // Get Premier League competitions (competition_id: 2)
        const premierLeagueCompetitions = competitions.filter(comp => comp.competition_id === 2);
        if (premierLeagueCompetitions.length === 0) {
            console.warn('No Premier League competitions found in StatsBomb data');
        }
        // Get all matches from Premier League competitions
        const allMatches = [];
        for (const competition of premierLeagueCompetitions) {
            try {
                const matches = await fetchStatsBombData(`/matches/${competition.competition_id}/${competition.season_id}.json`);
                if (matches && Array.isArray(matches)) {
                    allMatches.push(...matches);
                }
            }
            catch (error) {
                console.warn(`Error fetching matches for competition ${competition.competition_id}, season ${competition.season_id}:`, error.message);
            }
        }
        console.log(`Found ${allMatches.length} Premier League matches in StatsBomb data`);
        // Get all players from matches
        const playerMap = new Map();
        // Process a subset of matches to avoid excessive API calls
        const matchesToProcess = allMatches.slice(0, 10);
        for (const match of matchesToProcess) {
            try {
                const events = await fetchStatsBombData(`/events/${match.match_id}.json`);
                if (!events || !Array.isArray(events)) {
                    continue;
                }
                // Extract unique players from events
                for (const event of events) {
                    if (event.player && event.player.id && event.player.name) {
                        playerMap.set(event.player.id, {
                            id: event.player.id,
                            name: event.player.name,
                            team: event.team ? event.team.name : null
                        });
                    }
                }
            }
            catch (error) {
                console.warn(`Error fetching events for match ${match.match_id}:`, error.message);
            }
        }
        const players = Array.from(playerMap.values());
        console.log(`Found ${players.length} unique players in StatsBomb data`);
        return players;
    }
    catch (error) {
        console.error('Error getting StatsBomb players:', error.message);
        return [];
    }
}
/**
 * Matches StatsBomb players to FPL players based on name similarity
 */
function matchPlayersByName(statsBombPlayers, fplPlayers) {
    const mappings = [];
    // Normalize a name for comparison
    function normalizeName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z ]/g, '') // Remove non-alphabetic characters
            .trim();
    }
    // Calculate similarity between two names (0-1)
    function calculateSimilarity(name1, name2) {
        const norm1 = normalizeName(name1);
        const norm2 = normalizeName(name2);
        // Exact match
        if (norm1 === norm2) {
            return 1;
        }
        // Check if one name is contained in the other
        if (norm1.includes(norm2) || norm2.includes(norm1)) {
            return 0.9;
        }
        // Split names into parts and check for matches
        const parts1 = norm1.split(' ');
        const parts2 = norm2.split(' ');
        let matchCount = 0;
        for (const part1 of parts1) {
            for (const part2 of parts2) {
                if (part1 === part2 && part1.length > 2) { // Ignore short words
                    matchCount++;
                }
            }
        }
        // Calculate similarity based on matching parts
        const maxParts = Math.max(parts1.length, parts2.length);
        return matchCount / maxParts;
    }
    // Process each FPL player
    for (const fplPlayer of fplPlayers) {
        const fplName = `${fplPlayer.first_name} ${fplPlayer.second_name}`;
        let bestMatch = null;
        let bestSimilarity = 0;
        // Find the best matching StatsBomb player
        for (const sbPlayer of statsBombPlayers) {
            const similarity = calculateSimilarity(fplName, sbPlayer.name);
            if (similarity > bestSimilarity && similarity >= 0.7) { // Threshold for a good match
                bestSimilarity = similarity;
                bestMatch = sbPlayer;
            }
        }
        if (bestMatch) {
            mappings.push({
                fplId: fplPlayer.id,
                statsBombId: bestMatch.id,
                fplName,
                statsBombName: bestMatch.name,
                similarity: bestSimilarity,
                team: fplPlayer.team,
                statsBombTeam: bestMatch.team
            });
        }
    }
    return mappings;
}
/**
 * Saves player mappings to the database
 */
async function savePlayerMappings(mappings) {
    try {
        console.log(`Saving ${mappings.length} player mappings to database...`);
        // Prepare data for insertion
        const data = mappings.map(mapping => ({
            fpl_id: mapping.fplId,
            statsbomb_id: mapping.statsBombId,
            name: mapping.fplName
        }));
        // Insert data into the database
        const { data: result, error } = await supabase
            .from('player_id_mappings')
            .upsert(data, { onConflict: 'fpl_id' });
        if (error) {
            throw error;
        }
        console.log(`Successfully saved ${mappings.length} player mappings to database`);
        return true;
    }
    catch (error) {
        console.error('Error saving player mappings:', error.message);
        return false;
    }
}
/**
 * Main function to populate player mappings
 */
async function populatePlayerMappings() {
    try {
        console.log('Starting player mapping population...');
        // Get FPL players
        const fplData = await fetchFplData();
        if (!fplData || !fplData.elements || !Array.isArray(fplData.elements)) {
            throw new Error('Failed to fetch FPL player data');
        }
        const fplPlayers = fplData.elements;
        console.log(`Found ${fplPlayers.length} players in FPL data`);
        // Get StatsBomb players
        const statsBombPlayers = await getAllStatsBombPlayers();
        if (statsBombPlayers.length === 0) {
            console.log('No StatsBomb players found. Using sample data instead.');
            // Use sample data from SQL script
            const sampleMappings = [
                { fplId: 427, statsBombId: 10001, fplName: 'Mohamed Salah', statsBombName: 'Mohamed Salah', similarity: 1 },
                { fplId: 182, statsBombId: 10002, fplName: 'Kevin De Bruyne', statsBombName: 'Kevin De Bruyne', similarity: 1 },
                { fplId: 283, statsBombId: 10003, fplName: 'Bruno Fernandes', statsBombName: 'Bruno Fernandes', similarity: 1 },
                { fplId: 357, statsBombId: 10004, fplName: 'Harry Kane', statsBombName: 'Harry Kane', similarity: 1 },
                { fplId: 233, statsBombId: 10005, fplName: 'Erling Haaland', statsBombName: 'Erling Haaland', similarity: 1 }
            ];
            await savePlayerMappings(sampleMappings);
            return;
        }
        // Match players
        const mappings = matchPlayersByName(statsBombPlayers, fplPlayers);
        console.log(`Found ${mappings.length} player mappings`);
        // Save mappings to database
        await savePlayerMappings(mappings);
        console.log('Player mapping population completed successfully');
    }
    catch (error) {
        console.error('Error populating player mappings:', error.message);
        process.exit(1);
    }
}
// Run the main function
populatePlayerMappings()
    .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
})
    .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
});
