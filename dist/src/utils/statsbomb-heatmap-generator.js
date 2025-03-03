"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHeatmapForPlayer = generateHeatmapForPlayer;
exports.generatePlaceholderHeatmap = generatePlaceholderHeatmap;
const statsbomb_1 = require("./statsbomb");
// Constants for pitch dimensions and grid size
const PITCH_LENGTH = 120;
const PITCH_WIDTH = 80;
const GRID_SIZE = 5; // Size of each grid cell in meters
/**
 * Gets all available matches from StatsBomb
 */
async function getAvailableMatches() {
    try {
        // Get competitions
        const competitions = await (0, statsbomb_1.fetchStatsBombData)('/competitions.json');
        if (!competitions || !Array.isArray(competitions)) {
            throw new Error('Failed to fetch competitions data');
        }
        // Get all matches from all competitions
        const allMatches = [];
        for (const competition of competitions) {
            try {
                const matches = await (0, statsbomb_1.fetchStatsBombData)(`/matches/${competition.competition_id}/${competition.season_id}.json`);
                if (matches && Array.isArray(matches)) {
                    allMatches.push(...matches);
                }
            }
            catch (error) {
                console.warn(`Error fetching matches for competition ${competition.competition_id}, season ${competition.season_id}:`, error);
            }
        }
        return allMatches;
    }
    catch (error) {
        console.error('Error fetching available matches:', error);
        return [];
    }
}
/**
 * Gets events for a specific match
 */
async function getMatchEvents(matchId) {
    try {
        const events = await (0, statsbomb_1.fetchStatsBombData)(`/events/${matchId}.json`);
        if (!events || !Array.isArray(events)) {
            throw new Error(`Failed to fetch events for match ${matchId}`);
        }
        return events;
    }
    catch (error) {
        console.error(`Error fetching events for match ${matchId}:`, error);
        throw error;
    }
}
/**
 * Filters events for a specific player
 */
function filterPlayerEvents(events, playerId) {
    return events.filter(event => event.player &&
        event.player.id === playerId &&
        event.location &&
        Array.isArray(event.location) &&
        event.location.length === 2);
}
/**
 * Generates a heatmap from player events
 */
function generateHeatmapFromEvents(playerEvents) {
    // Create a grid to count events in each cell
    const gridCellsX = Math.ceil(PITCH_LENGTH / GRID_SIZE);
    const gridCellsY = Math.ceil(PITCH_WIDTH / GRID_SIZE);
    const grid = Array(gridCellsX).fill(0).map(() => Array(gridCellsY).fill(0));
    // Count events in each grid cell
    for (const event of playerEvents) {
        if (event.location && Array.isArray(event.location)) {
            const [x, y] = event.location;
            // Convert to grid coordinates
            const gridX = Math.floor(x / GRID_SIZE);
            const gridY = Math.floor(y / GRID_SIZE);
            // Ensure coordinates are within bounds
            if (gridX >= 0 && gridX < gridCellsX && gridY >= 0 && gridY < gridCellsY) {
                grid[gridX][gridY]++;
            }
        }
    }
    // Convert grid to heatmap points
    const heatmapPoints = [];
    for (let i = 0; i < gridCellsX; i++) {
        for (let j = 0; j < gridCellsY; j++) {
            if (grid[i][j] > 0) {
                heatmapPoints.push({
                    x: (i * GRID_SIZE) + (GRID_SIZE / 2), // Center of the cell
                    y: (j * GRID_SIZE) + (GRID_SIZE / 2), // Center of the cell
                    value: grid[i][j]
                });
            }
        }
    }
    return heatmapPoints;
}
/**
 * Generates a heatmap for a specific player
 */
async function generateHeatmapForPlayer(playerId) {
    try {
        // Get all available matches
        const matches = await getAvailableMatches();
        if (matches.length === 0) {
            throw new Error('No matches available');
        }
        // Process each match to find player events
        const playerEvents = [];
        const matchesIncluded = [];
        for (const match of matches) {
            try {
                const events = await getMatchEvents(match.match_id);
                const filteredEvents = filterPlayerEvents(events, playerId);
                if (filteredEvents.length > 0) {
                    playerEvents.push(...filteredEvents);
                    matchesIncluded.push(match.match_id);
                }
            }
            catch (error) {
                console.warn(`Error processing match ${match.match_id}:`, error);
            }
            // Limit to 10 matches to avoid excessive processing
            if (matchesIncluded.length >= 10) {
                break;
            }
        }
        if (playerEvents.length === 0) {
            throw new Error(`No events found for player ${playerId}`);
        }
        // Generate heatmap from events
        const heatmapData = generateHeatmapFromEvents(playerEvents);
        return {
            heatmapData,
            matchesIncluded,
            totalEvents: playerEvents.length
        };
    }
    catch (error) {
        console.error(`Error generating heatmap for player ${playerId}:`, error);
        throw error;
    }
}
/**
 * Generates a placeholder heatmap for testing
 */
function generatePlaceholderHeatmap() {
    const heatmapPoints = [];
    const numPoints = 50;
    for (let i = 0; i < numPoints; i++) {
        heatmapPoints.push({
            x: Math.random() * PITCH_LENGTH,
            y: Math.random() * PITCH_WIDTH,
            value: Math.floor(Math.random() * 10) + 1
        });
    }
    return heatmapPoints;
}
