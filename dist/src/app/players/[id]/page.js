"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlayerPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const fa_1 = require("react-icons/fa");
const PlayerImage_1 = __importDefault(require("@/components/PlayerImage"));
const PlayerStats_1 = __importDefault(require("@/components/PlayerStats"));
const PlayerHeatmap_1 = __importDefault(require("@/components/PlayerHeatmap"));
const LoadingSpinner_1 = __importDefault(require("@/components/LoadingSpinner"));
const supabase_1 = require("@/utils/supabase");
// Mock team data as fallback
const teams = [
    { id: 1, name: 'Arsenal', short_name: 'ARS' },
    { id: 2, name: 'Aston Villa', short_name: 'AVL' },
    { id: 3, name: 'Bournemouth', short_name: 'BOU' },
    { id: 4, name: 'Brentford', short_name: 'BRE' },
    { id: 5, name: 'Brighton', short_name: 'BHA' },
    { id: 6, name: 'Chelsea', short_name: 'CHE' },
    { id: 7, name: 'Crystal Palace', short_name: 'CRY' },
    { id: 8, name: 'Everton', short_name: 'EVE' },
    { id: 9, name: 'Fulham', short_name: 'FUL' },
    { id: 10, name: 'Liverpool', short_name: 'LIV' },
    { id: 11, name: 'Man City', short_name: 'MCI' },
    { id: 12, name: 'Man Utd', short_name: 'MUN' },
    { id: 13, name: 'Newcastle', short_name: 'NEW' },
    { id: 14, name: 'Nott\'m Forest', short_name: 'NFO' },
    { id: 15, name: 'Spurs', short_name: 'TOT' },
    { id: 16, name: 'West Ham', short_name: 'WHU' },
    { id: 17, name: 'Wolves', short_name: 'WOL' },
    { id: 18, name: 'Southampton', short_name: 'SOU' },
    { id: 19, name: 'Leicester', short_name: 'LEI' },
    { id: 20, name: 'Ipswich', short_name: 'IPS' },
];
async function PlayerPage({ params }) {
    const router = (0, navigation_1.useRouter)();
    const playerId = parseInt(params.id);
    const player = await (0, supabase_1.getPlayerFromCache)(playerId);
    if (!player) {
        return (<div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-700">Player not found</div>
      </div>);
    }
    // Calculate player age from birth date (mock data for now)
    const birthDate = new Date('2002-07-26');
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    // Get rating color based on value
    const getRatingColor = (rating) => {
        if (rating >= 8.0)
            return 'bg-blue-600 text-white';
        if (rating >= 7.0)
            return 'bg-green-600 text-white';
        if (rating >= 6.0)
            return 'bg-yellow-600 text-gray-900';
        if (rating >= 5.0)
            return 'bg-orange-600 text-white';
        return 'bg-red-600 text-white';
    };
    // Sample match ratings data - placeholder for API integration
    const matchRatings = [
        { date: '21 Aug', opponent: 'MUN', rating: 7.8, competition: 'PL', result: 'W' },
        { date: '28 Aug', opponent: 'CHE', rating: 6.5, competition: 'PL', result: 'D' },
        { date: '4 Sep', opponent: 'ARS', rating: 8.2, competition: 'PL', result: 'W' },
        { date: '11 Sep', opponent: 'LIV', rating: 5.9, competition: 'PL', result: 'L' },
        { date: '18 Sep', opponent: 'MCI', rating: 7.1, competition: 'PL', result: 'W' },
    ];
    // Sample monthly performance data - placeholder for API integration
    const monthlyPerformance = [
        { month: 'May', rating: 6.9 },
        { month: 'Jul', rating: 6.7 },
        { month: 'Sept', rating: 6.9 },
        { month: 'Nov', rating: 7.1 },
        { month: 'Dec', rating: 7.2 },
        { month: 'Jan', rating: 7.3 },
        { month: 'Feb', rating: 7.0 },
        { month: 'Mar', rating: 7.1 },
    ];
    return (<div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      {/* Back Button */}
      <button onClick={() => router.back()} className="flex items-center text-blue-400 hover:text-blue-300 mb-6">
        <fa_1.FaArrowLeft className="mr-2"/> Back to Players
      </button>

      {/* Player Header */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="w-24 h-24 relative mr-6 mb-4 md:mb-0">
            <PlayerImage_1.default playerId={playerId} playerName={player.data.web_name} positionShort={player.data.position_short}/>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">{player.data.web_name}</h1>
            <div className="text-gray-300 mb-2">
              {player.data.first_name} {player.data.second_name} · {player.data.team_name}
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <span className="bg-gray-700 text-green-400 px-2 py-1 rounded-full text-xs font-medium mr-2">
                {player.data.position || 'Unknown Position'}
              </span>
              <span className="flex items-center">
                <fa_1.FaFutbol className="mr-1"/> {player.data.total_points} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <div className="text-sm text-gray-500 mb-1">Minutes</div>
          <div className="text-2xl font-bold">{player.data.minutes}</div>
          <div className="w-full bg-gray-700 h-1 mt-2">
            <div className="bg-blue-600 h-1" style={{ width: `${Math.min((player.data.minutes / 3420) * 100, 100)}%` }}></div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <div className="text-sm text-gray-500 mb-1">Goals</div>
          <div className="text-2xl font-bold">{player.data.goals_scored}</div>
          <div className="w-full bg-gray-700 h-1 mt-2">
            <div className="bg-green-600 h-1" style={{ width: `${Math.min(player.data.goals_scored * 10, 100)}%` }}></div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <div className="text-sm text-gray-500 mb-1">Assists</div>
          <div className="text-2xl font-bold">{player.data.assists}</div>
          <div className="w-full bg-gray-700 h-1 mt-2">
            <div className="bg-yellow-600 h-1" style={{ width: `${Math.min(player.data.assists * 10, 100)}%` }}></div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
          <div className="text-sm text-gray-500 mb-1">Form</div>
          <div className="text-2xl font-bold">{player.data.form}</div>
          <div className="w-full bg-gray-700 h-1 mt-2">
            <div className="bg-purple-600 h-1" style={{ width: `${Math.min(parseFloat(player.data.form) * 20, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Player Bio */}
      <div className="bg-gray-800 rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Player Bio</h2>
          <div className="text-sm text-gray-400">Placeholder data - will be integrated with external API</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
          <div className="space-y-1">
            <div className="text-gray-500 text-sm">NATIONALITY</div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2 overflow-hidden">
                <span className="text-gray-200 font-bold">--</span>
              </div>
              <span className="text-xl text-gray-200">--</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-500 text-sm">AGE</div>
            <div className="text-xl text-gray-200">-- YRS</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-500 text-sm">HEIGHT</div>
            <div className="text-xl text-gray-200">-- cm</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-500 text-sm">PREFERRED FOOT</div>
            <div className="text-xl text-gray-200">--</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-500 text-sm">POSITION</div>
            <div className="text-xl text-gray-200">{player.data.position_short || '--'}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-500 text-sm">SHIRT NUMBER</div>
            <div className="text-xl text-gray-200">--</div>
          </div>
        </div>
      </div>

      {/* Performance Rating */}
      <div className="bg-gray-800 rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Performance Rating</h2>
            <div className="flex items-center text-sm text-gray-400">
              <fa_1.FaInfoCircle className="mr-1"/> 
              <span>Data placeholder - will be integrated with external API</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">PL</span>
                </div>
                <span className="text-xl">Premier League</span>
              </div>
              <div className="bg-gray-700 px-3 py-1 rounded text-gray-200">
                23/24
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Average Rating</h3>
            <div className="flex items-center">
              <div className={`${getRatingColor(7.21)} w-10 h-10 rounded-full flex items-center justify-center mr-2 font-bold`}>
                7.2
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
            {matchRatings.map((match, index) => (<div key={index} className="bg-gray-700 p-3 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-400">{match.date}</div>
                  <div className={`text-xs font-medium ${match.result === 'W' ? 'text-green-600' : match.result === 'L' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {match.result}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-1">
                      <span className="text-white text-xs font-bold">PL</span>
                    </div>
                    <span className="text-xs ml-1 text-gray-200">{match.opponent}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getRatingColor(match.rating)}`}>
                    {match.rating.toFixed(1)}
                  </div>
                </div>
              </div>))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gray-800 rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Performance Trend</h2>
          <div className="text-sm text-gray-400">Last 8 months - placeholder data</div>
        </div>
        <div className="p-6">
          <div className="h-48 relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-700"></div>
            
            <div className="flex justify-between h-full">
              {monthlyPerformance.map((month, index) => (<div key={index} className="flex flex-col items-center justify-end h-full">
                  <div className={`w-8 ${getRatingColor(month.rating)}`} style={{ height: `${(month.rating / 10) * 100}%` }}></div>
                  <div className="text-gray-500 mt-2 text-xs">{month.month}</div>
                  <div className="text-gray-200 mt-1 text-xs font-medium">{month.rating}</div>
                </div>))}
            </div>
            
            <div className="absolute right-0 top-0 bottom-0 w-6 flex flex-col justify-between">
              <div className="text-blue-600 text-xs">8.0</div>
              <div className="text-green-600 text-xs">7.0</div>
              <div className="text-yellow-600 text-xs">6.0</div>
              <div className="text-red-600 text-xs">5.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Season Statistics</h2>
          </div>
          <div className="p-6">
            <react_1.Suspense fallback={<LoadingSpinner_1.default />}>
              <PlayerStats_1.default playerId={playerId} type="season"/>
            </react_1.Suspense>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Form Analysis</h2>
          </div>
          <div className="p-6">
            <react_1.Suspense fallback={<LoadingSpinner_1.default />}>
              <PlayerStats_1.default playerId={playerId} type="form"/>
            </react_1.Suspense>
          </div>
        </div>
      </div>

      {/* Heatmaps Section */}
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Season Heatmap</h2>
            <div className="text-sm text-gray-400">Placeholder - will be integrated with external API</div>
          </div>
          <div className="p-6">
            <react_1.Suspense fallback={<LoadingSpinner_1.default />}>
              <PlayerHeatmap_1.default playerId={playerId} type="season"/>
            </react_1.Suspense>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Recent Fixtures Analysis</h2>
            <div className="text-sm text-gray-400">Placeholder - will be integrated with external API</div>
          </div>
          <div className="p-6">
            <react_1.Suspense fallback={<LoadingSpinner_1.default />}>
              <PlayerHeatmap_1.default playerId={playerId} type="fixtures"/>
            </react_1.Suspense>
          </div>
        </div>
      </div>
    </div>);
}
