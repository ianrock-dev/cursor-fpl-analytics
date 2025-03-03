"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const statsbomb_1 = require("@/utils/statsbomb");
async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const competitionId = searchParams.get('competitionId');
        const seasonId = searchParams.get('seasonId');
        if (!competitionId || !seasonId) {
            return server_1.NextResponse.json({
                status: 'error',
                message: 'Missing required parameters: competitionId and seasonId',
            }, { status: 400 });
        }
        const matches = await (0, statsbomb_1.getMatches)(parseInt(competitionId), parseInt(seasonId));
        return server_1.NextResponse.json({
            status: 'success',
            data: matches,
            attribution: 'Data provided by StatsBomb'
        });
    }
    catch (error) {
        console.error('Error fetching StatsBomb matches:', error);
        return server_1.NextResponse.json({
            status: 'error',
            message: 'Failed to fetch matches',
        }, { status: 500 });
    }
}
