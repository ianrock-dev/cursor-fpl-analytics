import { useEffect, useState } from 'react';
import { getPlayerFromCache } from '@/utils/supabase';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { useFBRefData } from '@/hooks/useFBRefData';

interface PlayerStatsProps {
  playerId: number;
  type?: 'basic' | 'advanced' | 'all';
}

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  source?: 'fpl' | 'fbref';
}

const StatCard = ({ title, value, subValue, trend, source }: StatCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-sm text-gray-500">{title}</h3>
        {source && (
          <span className={`text-xs px-2 py-1 rounded ${source === 'fpl' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {source === 'fpl' ? 'FPL' : 'FBRef'}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {subValue && <p className="ml-2 text-sm text-gray-500">{subValue}</p>}
      </div>
      {trend && (
        <div className={`mt-2 ${
          trend === 'up' ? 'text-green-600' :
          trend === 'down' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </div>
      )}
    </div>
  );
};

export default function PlayerStats({ playerId, type = 'basic' }: PlayerStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const player = await getPlayerFromCache(playerId);
        if (!player) {
          throw new Error('Player not found');
        }
        const playerData = player.data;
        
        // Fetch FBRef data
        const { fbrefStats } = useFBRefData(playerData.web_name);
        
        setStats({
          fpl: playerData,
          fbref: fbrefStats
        });
      } catch (error) {
        console.error('Error fetching player stats:', error);
        setError('Failed to load player statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId, type]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No data available</div>;

  const { fpl, fbref } = stats;

  const renderBasicStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* FPL Stats */}
      <StatCard
        title="Minutes Played"
        value={fpl.minutes}
        subValue={`${Math.round((fpl.minutes / 3420) * 100)}%`}
        source="fpl"
      />
      <StatCard
        title="Goals"
        value={fpl.goals_scored}
        subValue={fbref ? `FBRef: ${fbref.goals}` : undefined}
        source="fpl"
      />
      <StatCard
        title="Assists"
        value={fpl.assists}
        subValue={fbref ? `FBRef: ${fbref.assists}` : undefined}
        source="fpl"
      />
      <StatCard
        title="Clean Sheets"
        value={fpl.clean_sheets}
        source="fpl"
      />
      <StatCard
        title="Bonus Points"
        value={fpl.bonus}
        source="fpl"
      />
      <StatCard
        title="Total Points"
        value={fpl.total_points}
        source="fpl"
      />
      
      {/* FBRef Stats */}
      {fbref && (
        <>
          <StatCard
            title="Expected Goals (xG)"
            value={fbref.xG.toFixed(2)}
            source="fbref"
          />
          <StatCard
            title="Expected Assists (xA)"
            value={fbref.xA.toFixed(2)}
            source="fbref"
          />
          <StatCard
            title="Shots"
            value={fbref.shots}
            subValue={`On Target: ${fbref.shotsOnTarget}`}
            source="fbref"
          />
        </>
      )}
    </div>
  );

  const renderAdvancedStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* FPL Advanced Stats */}
      <StatCard
        title="Form"
        value={fpl.form}
        trend={parseFloat(fpl.form) > 5 ? 'up' : 'down'}
        source="fpl"
      />
      <StatCard
        title="Points Per Game"
        value={fpl.points_per_game}
        trend={parseFloat(fpl.points_per_game) > 4 ? 'up' : 'down'}
        source="fpl"
      />
      <StatCard
        title="Selected By"
        value={`${fpl.selected_by_percent}%`}
        trend={parseFloat(fpl.selected_by_percent) > 10 ? 'up' : 'down'}
        source="fpl"
      />
      <StatCard
        title="Price"
        value={`£${(fpl.now_cost / 10).toFixed(1)}m`}
        source="fpl"
      />
      <StatCard
        title="Price Change"
        value={`${(fpl.cost_change_start / 10).toFixed(1)}`}
        trend={fpl.cost_change_start > 0 ? 'up' : fpl.cost_change_start < 0 ? 'down' : 'neutral'}
        source="fpl"
      />
      <StatCard
        title="ICT Index"
        value={fpl.ict_index}
        trend={parseFloat(fpl.ict_index) > 100 ? 'up' : 'down'}
        source="fpl"
      />

      {/* FBRef Advanced Stats */}
      {fbref && (
        <>
          <StatCard
            title="Progressive Carries"
            value={fbref.progressiveCarries}
            source="fbref"
          />
          <StatCard
            title="Progressive Passes"
            value={fbref.progressivePasses}
            source="fbref"
          />
          <StatCard
            title="Shot Conversion"
            value={`${((fbref.goals / fbref.shots) * 100).toFixed(1)}%`}
            subValue={`${fbref.goals} goals from ${fbref.shots} shots`}
            source="fbref"
          />
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {type === 'basic' && renderBasicStats()}
      {type === 'advanced' && renderAdvancedStats()}
      {type === 'all' && (
        <>
          {renderBasicStats()}
          <div className="my-6 border-t border-gray-200" />
          {renderAdvancedStats()}
        </>
      )}
    </div>
  );
} 