"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const statsbomb_1 = require("@/utils/statsbomb");
async function GET() {
    try {
        const competitions = await (0, statsbomb_1.getCompetitions)();
        // Filter to include only relevant competitions (e.g., Premier League)
        const filteredCompetitions = competitions.filter(comp => comp.competition_name.includes('Premier League') ||
            comp.competition_name.includes('La Liga') ||
            comp.competition_name.includes('Serie A') ||
            comp.competition_name.includes('Bundesliga') ||
            comp.competition_name.includes('Champions League'));
        return server_1.NextResponse.json({
            status: 'success',
            data: filteredCompetitions,
            attribution: 'Data provided by StatsBomb'
        });
    }
    catch (error) {
        console.error('Error fetching StatsBomb competitions:', error);
        return server_1.NextResponse.json({
            status: 'error',
            message: 'Failed to fetch competitions',
        }, { status: 500 });
    }
}
