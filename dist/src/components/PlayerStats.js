"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlayerStats;
const react_1 = require("react");
const supabase_1 = require("@/utils/supabase");
const fa_1 = require("react-icons/fa");
function PlayerStats({ playerId, type }) {
    const [stats, setStats] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        async function fetchStats() {
            try {
                const player = await (0, supabase_1.getPlayerFromCache)(playerId);
                if (!player) {
                    setLoading(false);
                    return;
                }
                const playerData = player.data;
                if (type === 'season') {
                    setStats([
                        {
                            label: 'Minutes',
                            value: playerData.minutes,
                            color: 'bg-blue-600',
                            textColor: 'text-gray-800',
                            subValue: `${Math.round((playerData.minutes / 3420) * 100)}%`,
                            trend: 'neutral'
                        },
                        {
                            label: 'Goals',
                            value: playerData.goals_scored,
                            color: 'bg-green-600',
                            textColor: 'text-gray-800',
                            trend: 'up'
                        },
                        {
                            label: 'Assists',
                            value: playerData.assists,
                            color: 'bg-yellow-600',
                            textColor: 'text-gray-800',
                            trend: 'neutral'
                        },
                        {
                            label: 'Clean Sheets',
                            value: playerData.clean_sheets,
                            color: 'bg-purple-600',
                            textColor: 'text-gray-800',
                            trend: 'up'
                        },
                        {
                            label: 'Bonus Points',
                            value: playerData.bonus,
                            color: 'bg-pink-600',
                            textColor: 'text-gray-800',
                            trend: 'up'
                        },
                        {
                            label: 'Total Points',
                            value: playerData.total_points,
                            color: 'bg-red-600',
                            textColor: 'text-gray-800',
                            trend: 'up'
                        },
                    ]);
                }
                else {
                    // Form stats
                    setStats([
                        {
                            label: 'Form',
                            value: playerData.form,
                            color: 'bg-blue-600',
                            textColor: 'text-gray-800',
                            trend: parseFloat(playerData.form) > 5 ? 'up' : 'down'
                        },
                        {
                            label: 'Points Per Game',
                            value: playerData.points_per_game,
                            color: 'bg-green-600',
                            textColor: 'text-gray-800',
                            trend: parseFloat(playerData.points_per_game) > 4 ? 'up' : 'down'
                        },
                        {
                            label: 'Selected By',
                            value: `${playerData.selected_by_percent}%`,
                            color: 'bg-yellow-600',
                            textColor: 'text-gray-800',
                            trend: parseFloat(playerData.selected_by_percent) > 10 ? 'up' : 'down'
                        },
                        {
                            label: 'Price',
                            value: `£${(playerData.now_cost / 10).toFixed(1)}m`,
                            color: 'bg-purple-600',
                            textColor: 'text-gray-800',
                            trend: 'neutral'
                        },
                        {
                            label: 'Price Change',
                            value: (playerData.cost_change_start / 10).toFixed(1),
                            color: 'bg-pink-600',
                            textColor: 'text-gray-800',
                            trend: playerData.cost_change_start > 0 ? 'up' : playerData.cost_change_start < 0 ? 'down' : 'neutral'
                        },
                        {
                            label: 'ICT Index',
                            value: playerData.ict_index,
                            color: 'bg-red-600',
                            textColor: 'text-gray-800',
                            trend: parseFloat(playerData.ict_index) > 100 ? 'up' : 'down'
                        },
                    ]);
                }
            }
            catch (error) {
                console.error('Error fetching player stats:', error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [playerId, type]);
    const getTrendIcon = (trend) => {
        if (trend === 'up')
            return <fa_1.FaArrowUp className="text-green-600"/>;
        if (trend === 'down')
            return <fa_1.FaArrowDown className="text-red-600"/>;
        return <fa_1.FaMinus className="text-gray-400"/>;
    };
    if (loading) {
        return (<div className="animate-pulse">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (<div key={i} className="h-20 bg-gray-700 rounded"></div>))}
        </div>
      </div>);
    }
    return (<div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (<div key={index} className="p-4 rounded-lg bg-gray-800 border border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
            <div className="text-xs">{getTrendIcon(stat.trend)}</div>
          </div>
          <div className="flex items-end mt-1">
            <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
            {stat.subValue && (<div className="ml-2 text-xs text-gray-400 mb-1">{stat.subValue}</div>)}
          </div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div className={`${stat.color} h-2 rounded-full`} style={{
                width: typeof stat.value === 'number'
                    ? `${Math.min(stat.value * 5, 100)}%`
                    : typeof stat.value === 'string' && stat.value.includes('%')
                        ? stat.value
                        : '50%'
            }}></div>
          </div>
        </div>))}
    </div>);
}
