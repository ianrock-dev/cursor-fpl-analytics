"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapStatsBombToFplPlayerId = exports.generatePlayerHeatmap = exports.getThreeSixty = exports.getLineups = exports.getEvents = exports.getMatches = exports.getCompetitions = void 0;
exports.fetchStatsBombData = fetchStatsBombData;
exports.mapFplToStatsBombPlayerId = mapFplToStatsBombPlayerId;
exports.generateHeatmapFromEvents = generateHeatmapFromEvents;
const react_1 = require("react");
// Base URL for StatsBomb open data
const STATSBOMB_BASE_URL = 'https://raw.githubusercontent.com/statsbomb/open-data/master/data';
// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;
// In-memory cache
let competitionsCache = null;
let competitionsCacheTime = null;
let matchesCache = {};
let matchesCacheTime = {};
let eventsCache = {};
let eventsCacheTime = {};
let lineupsCache = {};
let lineupsCacheTime = {};
let threeSixtyCache = {};
let threeSixtyCacheTime = {};
/**
 * Fetches data from the StatsBomb GitHub repository
 */
async function fetchStatsBombData(path) {
    try {
        const response = await fetch(`${STATSBOMB_BASE_URL}/${path}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch StatsBomb data: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error(`Error fetching StatsBomb data from ${path}:`, error);
        throw error;
    }
}
/**
 * Fetches all available competitions from StatsBomb
 */
exports.getCompetitions = (0, react_1.cache)(async () => {
    const now = Date.now();
    // Return cached data if available and not expired
    if (competitionsCache && competitionsCacheTime && now - competitionsCacheTime < CACHE_DURATION) {
        console.log('Using cached competitions data');
        return competitionsCache;
    }
    console.log('Fetching competitions from StatsBomb');
    const competitions = await fetchStatsBombData('competitions.json');
    // Update cache
    competitionsCache = competitions;
    competitionsCacheTime = now;
    return competitions;
});
/**
 * Fetches matches for a specific competition and season
 */
exports.getMatches = (0, react_1.cache)(async (competitionId, seasonId) => {
    const cacheKey = `${competitionId}-${seasonId}`;
    const now = Date.now();
    // Return cached data if available and not expired
    if (matchesCache[cacheKey] && matchesCacheTime[cacheKey] && now - matchesCacheTime[cacheKey] < CACHE_DURATION) {
        console.log(`Using cached matches data for competition ${competitionId}, season ${seasonId}`);
        return matchesCache[cacheKey];
    }
    console.log(`Fetching matches for competition ${competitionId}, season ${seasonId} from StatsBomb`);
    const matches = await fetchStatsBombData(`matches/${competitionId}/${seasonId}.json`);
    // Update cache
    matchesCache[cacheKey] = matches;
    matchesCacheTime[cacheKey] = now;
    return matches;
});
/**
 * Fetches events for a specific match
 */
exports.getEvents = (0, react_1.cache)(async (matchId) => {
    const cacheKey = `${matchId}`;
    const now = Date.now();
    // Return cached data if available and not expired
    if (eventsCache[cacheKey] && eventsCacheTime[cacheKey] && now - eventsCacheTime[cacheKey] < CACHE_DURATION) {
        console.log(`Using cached events data for match ${matchId}`);
        return eventsCache[cacheKey];
    }
    console.log(`Fetching events for match ${matchId} from StatsBomb`);
    const events = await fetchStatsBombData(`events/${matchId}.json`);
    // Update cache
    eventsCache[cacheKey] = events;
    eventsCacheTime[cacheKey] = now;
    return events;
});
/**
 * Fetches lineups for a specific match
 */
exports.getLineups = (0, react_1.cache)(async (matchId) => {
    const cacheKey = `${matchId}`;
    const now = Date.now();
    // Return cached data if available and not expired
    if (lineupsCache[cacheKey] && lineupsCacheTime[cacheKey] && now - lineupsCacheTime[cacheKey] < CACHE_DURATION) {
        console.log(`Using cached lineups data for match ${matchId}`);
        return lineupsCache[cacheKey];
    }
    console.log(`Fetching lineups for match ${matchId} from StatsBomb`);
    const lineups = await fetchStatsBombData(`lineups/${matchId}.json`);
    // Update cache
    lineupsCache[cacheKey] = lineups;
    lineupsCacheTime[cacheKey] = now;
    return lineups;
});
/**
 * Fetches 360 data for a specific match (if available)
 */
exports.getThreeSixty = (0, react_1.cache)(async (matchId) => {
    const cacheKey = `${matchId}`;
    const now = Date.now();
    // Return cached data if available and not expired
    if (threeSixtyCache[cacheKey] && threeSixtyCacheTime[cacheKey] && now - threeSixtyCacheTime[cacheKey] < CACHE_DURATION) {
        console.log(`Using cached 360 data for match ${matchId}`);
        return threeSixtyCache[cacheKey];
    }
    try {
        console.log(`Fetching 360 data for match ${matchId} from StatsBomb`);
        const threeSixty = await fetchStatsBombData(`three-sixty/${matchId}.json`);
        // Update cache
        threeSixtyCache[cacheKey] = threeSixty;
        threeSixtyCacheTime[cacheKey] = now;
        return threeSixty;
    }
    catch (error) {
        console.log(`No 360 data available for match ${matchId}`);
        return [];
    }
});
/**
 * Generates a heatmap for a player based on their events in a match
 */
const generatePlayerHeatmap = async (playerId, matchId) => {
    try {
        const events = await (0, exports.getEvents)(matchId);
        // Filter events for the specific player
        const playerEvents = events.filter(event => event.player && event.player.id === playerId && event.location);
        // Generate heatmap data
        const heatmapData = playerEvents.map(event => ({
            x: event.location[0],
            y: event.location[1],
            value: 1
        }));
        return heatmapData;
    }
    catch (error) {
        console.error(`Error generating heatmap for player ${playerId} in match ${matchId}:`, error);
        return [];
    }
};
exports.generatePlayerHeatmap = generatePlayerHeatmap;
/**
 * Maps a StatsBomb player ID to an FPL player ID
 * @param statsBombPlayerId The StatsBomb player ID
 * @returns The FPL player ID or null if no mapping exists
 */
const mapStatsBombToFplPlayerId = (statsBombPlayerId) => {
    // This is a reverse lookup of the FPL to StatsBomb mapping
    const mapping = {
        // Euro 2020 players
        8660: 14, // Harry Kane (England) -> Aubameyang
        5487: 427, // Raheem Sterling (England) -> Salah
        3957: 283, // Lorenzo Insigne (Italy) -> De Bruyne
        20589: 233, // Ciro Immobile (Italy) -> Kane
        5213: 357, // Federico Chiesa (Italy) -> Son
        5246: 19, // Alvaro Morata (Spain) -> Aguero
        // Midfielders
        5207: 80, // Jorginho (Italy) -> Bruno Fernandes
        5201: 392, // Marco Verratti (Italy) -> Sterling
        5463: 254, // Declan Rice (England) -> Jorginho
        5485: 463, // Mason Mount (England) -> Ward-Prowse
        5203: 302, // Nicolò Barella (Italy) -> Maddison
        // Defenders
        5470: 182, // Luke Shaw (England) -> Chilwell
        5469: 245, // Kyle Walker (England) -> James
        5211: 164, // Leonardo Bonucci (Italy) -> Cancelo
        5212: 122, // Giorgio Chiellini (Italy) -> Dias
        5468: 376, // John Stones (England) -> Trent
        // Goalkeepers
        5467: 494, // Jordan Pickford (England) -> Alisson
        5206: 212, // Gianluigi Donnarumma (Italy) -> Ederson
        // Women's World Cup players
        6616: 1, // Megan Rapinoe (USA) -> Generic player 1
        6599: 2, // Alex Morgan (USA) -> Generic player 2
        6600: 3, // Rose Lavelle (USA) -> Generic player 3
        6598: 4, // Julie Ertz (USA) -> Generic player 4
        6597: 5, // Tobin Heath (USA) -> Generic player 5
        6614: 6, // Christen Press (USA) -> Generic player 6
        6601: 7, // Lindsey Horan (USA) -> Generic player 7
        6602: 8, // Sam Mewis (USA) -> Generic player 8
        6603: 9, // Becky Sauerbrunn (USA) -> Generic player 9
        6604: 10, // Alyssa Naeher (USA) -> Generic player 10
    };
    return mapping[statsBombPlayerId] || null;
};
exports.mapStatsBombToFplPlayerId = mapStatsBombToFplPlayerId;
/**
 * Maps FPL player IDs to StatsBomb player IDs
 * @param fplPlayerId The FPL player ID
 * @returns The StatsBomb player ID if available, otherwise null
 */
function mapFplToStatsBombPlayerId(fplPlayerId) {
    // For now, we'll use placeholder IDs since we don't have a reliable mapping
    // In a production environment, you would maintain a proper mapping database
    // These are placeholder IDs - in a real implementation, you would use actual StatsBomb IDs
    // We're using these to demonstrate the concept
    const mapping = {
        // Map some popular players to placeholder IDs
        427: 10001, // Mohamed Salah
        233: 10002, // Harry Kane
        357: 10003, // Erling Haaland
        318: 10004, // Bukayo Saka
        390: 10005, // Son Heung-min
        283: 10006, // Bruno Fernandes
        19: 10007, // Kevin De Bruyne
        80: 10008, // Phil Foden
        254: 10009, // Jorginho
        302: 10010, // James Maddison
        182: 10011, // Ben Chilwell
        245: 10012, // Reece James
        164: 10013, // João Cancelo
        122: 10014, // Rúben Dias
        376: 10015, // Trent Alexander-Arnold
        494: 10016, // Alisson
        212: 10017, // Ederson
    };
    return mapping[fplPlayerId] || null;
}
/**
 * Generates a heatmap from StatsBomb event data for a specific player
 * @param events Array of StatsBomb events
 * @param playerId The StatsBomb player ID
 * @returns Array of heatmap points with x, y coordinates and values
 */
function generateHeatmapFromEvents(events, playerId) {
    // Filter events to only include those for the specified player
    const playerEvents = events.filter(event => event.player && event.player.id === playerId && event.location);
    if (playerEvents.length === 0) {
        console.log(`No events found for player ${playerId}`);
        return [];
    }
    // Create a map to count occurrences at each location
    // We'll round coordinates to create "bins" for the heatmap
    const locationCounts = new Map();
    // Process each event to extract locations
    playerEvents.forEach(event => {
        if (!event.location)
            return;
        // StatsBomb coordinates: x is 0-120 (length), y is 0-80 (width)
        const [x, y] = event.location;
        // Round to nearest grid point (every 5 units)
        const roundedX = Math.round(x / 5) * 5;
        const roundedY = Math.round(y / 5) * 5;
        // Create a key for this location
        const locationKey = `${roundedX},${roundedY}`;
        // Update the count for this location
        if (locationCounts.has(locationKey)) {
            const existing = locationCounts.get(locationKey);
            existing.count += 1;
        }
        else {
            locationCounts.set(locationKey, { x: roundedX, y: roundedY, count: 1 });
        }
    });
    // Convert the map to an array of heatmap points
    const pointsWithCount = Array.from(locationCounts.values());
    // Normalize the values to be between 0 and 1
    if (pointsWithCount.length > 0) {
        const maxCount = Math.max(...pointsWithCount.map(p => p.count));
        // Create the final heatmap points with normalized values
        const heatmapPoints = pointsWithCount.map(point => ({
            x: point.x,
            y: point.y,
            value: point.count / maxCount
        }));
        return heatmapPoints;
    }
    return [];
}
