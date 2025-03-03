"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const supabase_1 = require("@/utils/supabase");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function GET(request, { params }) {
    var _a;
    const playerId = params.id;
    try {
        // Try to fetch the player image from the Premier League API
        const urls = [
            `https://resources.premierleague.com/premierleague/photos/players/250x250/p${playerId}.png`,
            `https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/250x250/p${playerId}.png`,
            `https://resources.premierleague.com/premierleague/photos/players/110x140/p${playerId}.png`
        ];
        // Try each URL in order
        for (const url of urls) {
            try {
                const imageResponse = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                if (imageResponse.ok) {
                    const imageBuffer = await imageResponse.arrayBuffer();
                    return new server_1.NextResponse(Buffer.from(imageBuffer), {
                        headers: {
                            'Content-Type': 'image/png',
                            'Cache-Control': 'public, max-age=86400'
                        }
                    });
                }
            }
            catch (error) {
                console.error(`Failed to fetch image from ${url}`, error);
            }
        }
        // If we get here, all URLs failed, so use a placeholder image
        // First, try to get player position to use position-specific placeholder
        let position = 'unknown';
        try {
            const playerData = await (0, supabase_1.getPlayerFromCache)(parseInt(playerId));
            if (playerData && playerData.data) {
                position = ((_a = playerData.data.position_short) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'unknown';
            }
        }
        catch (error) {
            console.error('Error fetching player data for placeholder:', error);
        }
        // Check if we have a position-specific placeholder
        const placeholderPath = path_1.default.join(process.cwd(), 'public', 'images', 'players', `placeholder-${position}.png`);
        const defaultPlaceholderPath = path_1.default.join(process.cwd(), 'public', 'images', 'players', 'placeholder.png');
        let imagePath;
        if (fs_1.default.existsSync(placeholderPath)) {
            imagePath = placeholderPath;
        }
        else if (fs_1.default.existsSync(defaultPlaceholderPath)) {
            imagePath = defaultPlaceholderPath;
        }
        else {
            // If no placeholder exists, return a 404
            return new server_1.NextResponse('Player image not found', { status: 404 });
        }
        const imageBuffer = fs_1.default.readFileSync(imagePath);
        return new server_1.NextResponse(imageBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=86400'
            }
        });
    }
    catch (error) {
        console.error('Error in player image API:', error);
        return new server_1.NextResponse('Error fetching player image', { status: 500 });
    }
}
