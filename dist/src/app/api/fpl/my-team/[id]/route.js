"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const axios_1 = __importDefault(require("axios"));
async function GET(request, { params }) {
    var _a, _b;
    const id = params.id;
    try {
        // Add a user agent to mimic a browser request
        const response = await axios_1.default.get(`https://fantasy.premierleague.com/api/my-team/${id}/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json',
            },
            timeout: 10000,
        });
        return server_1.NextResponse.json(response.data);
    }
    catch (error) {
        console.error('Error fetching FPL team info data:', error.message);
        // Return detailed error information for debugging
        return server_1.NextResponse.json({
            error: 'Failed to fetch team info data',
            message: error.message,
            status: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500
        }, { status: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500 });
    }
}
