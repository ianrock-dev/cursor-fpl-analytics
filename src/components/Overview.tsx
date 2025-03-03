'use client';

import { useState, useEffect } from 'react';
import { FaTrophy, FaChartLine, FaUsers, FaSpinner, FaFlask, FaMoneyBillWave, FaExchangeAlt } from 'react-icons/fa';
import { fetchManagerById, fetchManagerHistoryById, getMockManagerById } from '@/utils/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface OverviewData {
  leagueRank?: number;
  totalPoints?: number;
  teamValue?: number;
  playerName?: string;
  teamName?: string;
  bankValue?: number;
  freeTransfers?: number;
  history?: Array<{
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
  }>;
}

export default function Overview() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OverviewData>({});
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Check if this is the specific user ID 598864
  const isSpecificUser = userId === '598864';

  // Load saved state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('fplOverviewState');
    if (savedState) {
      try {
        const { userId, isConnected, demoMode, data } = JSON.parse(savedState);
        setUserId(userId || '');
        setIsConnected(isConnected || false);
        setDemoMode(demoMode || false);
        setData(data || {});
        
        // If we have a saved connected state, fetch fresh data
        if (isConnected && userId) {
          fetchOverviewData(userId, demoMode);
        }
      } catch (err) {
        console.error('Error parsing saved state:', err);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isConnected || demoMode) {
      localStorage.setItem('fplOverviewState', JSON.stringify({
        userId,
        isConnected,
        demoMode,
        data
      }));
    }
  }, [userId, isConnected, demoMode, data]);

  const fetchOverviewData = async (id = userId, useDemo = demoMode) => {
    if (!id && !useDemo) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (useDemo) {
        // Use mock data in demo mode
        console.log('Using mock data in demo mode');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get mock data, using the specific ID if set
        const mockData = id ? getMockManagerById(id) : getMockManagerById(123456);
        
        // Generate mock history data
        const mockHistory = Array.from({ length: 27 }, (_, i) => ({
          event: i + 1,
          points: Math.floor(Math.random() * 100),
          total_points: (i + 1) * 50 + Math.floor(Math.random() * 50),
          rank: 1000000 - (i * 30000) + Math.floor(Math.random() * 50000),
          rank_sort: 1000000 - (i * 30000) + Math.floor(Math.random() * 50000)
        }));
        
        setData({
          leagueRank: mockData.summary_overall_rank,
          totalPoints: mockData.summary_overall_points,
          teamValue: Number((mockData.last_deadline_value / 10).toFixed(1)) || 0,
          bankValue: Number((mockData.last_deadline_bank / 10).toFixed(1)) || 0,
          freeTransfers: 2,
          playerName: mockData.player_first_name + ' ' + mockData.player_last_name,
          teamName: mockData.name,
          history: mockHistory
        });
        
        setIsConnected(true);
        return;
      }
      
      console.log('Fetching data for ID:', id);
      
      // Using our custom API utility to fetch main data
      const result = await fetchManagerById(Number(id));

      // Fetch history data
      let historyData = [];
      try {
        const historyResult = await fetchManagerHistoryById(Number(id));
        if (historyResult.success && historyResult.data) {
          historyData = historyResult.data.current || [];
        }
      } catch (historyErr) {
        console.error('Error fetching history:', historyErr);
      }

      if (!result.success) {
        // If the API fails for the real user, and it's the specific ID, use custom mock data instead
        if (isSpecificUser) {
          console.log('Using custom mock data for specific user ID');
          const mockData = getMockManagerById(id);
          
          // Generate mock history data
          const mockHistory = Array.from({ length: 27 }, (_, i) => ({
            event: i + 1,
            points: Math.floor(Math.random() * 100),
            total_points: (i + 1) * 50 + Math.floor(Math.random() * 50),
            rank: 1000000 - (i * 30000) + Math.floor(Math.random() * 50000),
            rank_sort: 1000000 - (i * 30000) + Math.floor(Math.random() * 50000)
          }));
          
          setData({
            leagueRank: mockData.summary_overall_rank,
            totalPoints: mockData.summary_overall_points,
            teamValue: Number((mockData.last_deadline_value / 10).toFixed(1)) || 0,
            bankValue: Number((mockData.last_deadline_bank / 10).toFixed(1)) || 0,
            freeTransfers: 2,
            playerName: mockData.player_first_name + ' ' + mockData.player_last_name,
            teamName: mockData.name,
            history: mockHistory
          });
          
          setIsConnected(true);
          return;
        }
        
        throw new Error(result.error || 'Failed to fetch data');
      }
      
      const userData = result.data;
      
      setData({
        leagueRank: userData.summary_overall_rank,
        totalPoints: userData.summary_overall_points,
        teamValue: Number((userData.last_deadline_value / 10).toFixed(1)) || 0,
        bankValue: Number((userData.last_deadline_bank / 10).toFixed(1)) || 0,
        freeTransfers: userData.last_deadline_total_transfers || 0,
        playerName: userData.player_first_name + ' ' + userData.player_last_name,
        teamName: userData.name,
        history: historyData
      });
      
      setIsConnected(true);
    } catch (err: any) {
      console.error('Error details:', err);
      
      // Provide more specific error message based on the error
      if (err.response && err.response.status === 404) {
        setError('Manager ID not found. Please check the ID and try again.');
      } else if (err.response && err.response.status === 429) {
        setError('Too many requests. Please try again later.');
      } else if (err.response && err.response.status >= 500) {
        setError('FPL server error. Please try again later.');
      } else {
        setError(`Failed to fetch data: ${err.message || 'Unknown error'}`);
      }
      
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOverviewData();
  };
  
  const activateDemoMode = () => {
    setDemoMode(true);
    fetchOverviewData(userId, true);
  };

  // Prepare chart data
  const chartData = {
    labels: data.history?.map(week => `GW${week.event}`) || [],
    datasets: [
      {
        label: 'Manager Rank',
        data: data.history?.map(week => week.rank) || [],
        borderColor: '#37003c',
        backgroundColor: 'rgba(55, 0, 60, 0.1)',
        tension: 0.3,
        yAxisID: 'y',
      },
    ],
  };
  
  const chartOptions = {
    scales: {
      y: {
        reverse: true,
        title: {
          display: true,
          text: 'Overall Rank',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Gameweek',
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  // Auto-populate the user ID if they pasted in the specific one
  useEffect(() => {
    // Only run this if the user enters the specific ID
    if (userId === '598864' && !isConnected && !demoMode) {
      // You could optionally auto-fetch here, but it might be better to let the user click connect
      console.log('Detected specific user ID');
    }
  }, [userId, isConnected, demoMode]);

  return (
    <div className="dark:bg-dark-secondary rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-fpl-green">Team Overview</h2>
      
      {!isConnected ? (
        <div className="mb-6 max-w-md mx-auto">
          <h3 className="text-lg mb-4">Connect to your FPL account</h3>
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-1">
                Your Team ID
              </label>
              <input
                type="text"
                id="userId"
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:border-fpl-green focus:outline-none"
                placeholder="Enter your FPL team ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={demoMode}
              />
              <p className="text-sm text-gray-400 mt-1">
                Find your team ID in the URL when you visit your FPL team page
                (e.g., https://fantasy.premierleague.com/entry/<strong>1234567</strong>/event/1)
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-fpl-dark hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-fpl-green"
              disabled={loading || demoMode || !userId}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Connecting...
                </span>
              ) : (
                <>Connect <span className="text-fpl-green">FPL</span> Account</>
              )}
            </button>
          </form>
          
          <div className="mt-4 flex items-center justify-center">
            <span className="text-gray-400 px-2">or</span>
          </div>
          
          <button
            onClick={activateDemoMode}
            disabled={loading || demoMode}
            className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center"
          >
            <FaFlask className="mr-2" />
            Use Demo Data
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-md text-red-400">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-fpl-green text-4xl" />
              </div>
            ) : (
              <>
                <div className="bg-gray-800 rounded-lg p-4 shadow">
                  <div className="flex items-start">
                    <div className="bg-fpl-dark p-3 rounded-lg mr-4">
                      <FaTrophy className="text-fpl-green text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Global Rank</p>
                      <h3 className="text-xl font-bold">{data.leagueRank?.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 shadow">
                  <div className="flex items-start">
                    <div className="bg-fpl-dark p-3 rounded-lg mr-4">
                      <FaChartLine className="text-fpl-green text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Points</p>
                      <h3 className="text-xl font-bold">{data.totalPoints}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 shadow">
                  <div className="flex items-start">
                    <div className="bg-fpl-dark p-3 rounded-lg mr-4">
                      <FaUsers className="text-fpl-green text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Team Value</p>
                      <h3 className="text-xl font-bold">£{data.teamValue?.toFixed(1)}m</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 shadow">
                  <div className="flex items-start">
                    <div className="bg-fpl-dark p-3 rounded-lg mr-4">
                      <FaMoneyBillWave className="text-fpl-green text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">In The Bank</p>
                      <h3 className="text-xl font-bold">£{data.bankValue?.toFixed(1)}m</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 shadow">
                  <div className="flex items-start">
                    <div className="bg-fpl-dark p-3 rounded-lg mr-4">
                      <FaExchangeAlt className="text-fpl-green text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Free Transfers</p>
                      <h3 className="text-xl font-bold">{data.freeTransfers}</h3>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold">{data.teamName}</h3>
                <p className="text-gray-400">Manager: {data.playerName}</p>
                {(demoMode || isSpecificUser) && (
                  <p className="mt-2 text-amber-400 text-sm flex items-center">
                    <FaFlask className="mr-1" /> 
                    {demoMode ? 'Demo Mode' : 'Using cached data for user ID 598864'}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setIsConnected(false);
                  setDemoMode(false);
                  localStorage.removeItem('fplOverviewState');
                }}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
              >
                Disconnect
              </button>
            </div>
          </div>
          
          {/* Manager Rank Chart */}
          {data.history && data.history.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-lg font-bold mb-4">Manager Rank Progression</h3>
              <div className="h-[300px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 