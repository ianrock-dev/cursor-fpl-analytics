"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const axios_1 = __importDefault(require("axios"));
const supabase_1 = require("@/utils/supabase");
async function GET(request, { params }) {
    try {
        const playerId = params.id;
        if (!playerId) {
            return server_1.NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
        }
        // Try to get data from cache first
        const cachedData = await (0, supabase_1.getPlayerSummaryFromCache)(Number(playerId));
        if (cachedData) {
            console.log(`Using cached summary data for player ${playerId}`);
            return server_1.NextResponse.json(cachedData);
        }
        // If not in cache, fetch from FPL API
        console.log(`Fetching fresh summary data for player ${playerId} from FPL API`);
        const response = await axios_1.default.get(`https://fantasy.premierleague.com/api/element-summary/${playerId}/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
            },
            timeout: 10000,
        });
        if (response.status !== 200) {
            throw new Error(`Error fetching data: ${response.status}`);
        }
        const data = response.data;
        // Cache the response for future requests
        await (0, supabase_1.cachePlayerSummary)(Number(playerId), data);
        return server_1.NextResponse.json(data);
    }
    catch (error) {
        console.error('Error in player-summary API:', error.message);
        return server_1.NextResponse.json({ error: 'Failed to fetch player summary data' }, { status: 500 });
    }
}
