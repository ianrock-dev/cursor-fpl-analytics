'use client';

import { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import PlayerImage from './PlayerImage';

// FPL API interfaces
interface FplApiResponse {
  elements: FplPlayer[];
  teams: FplTeam[];
  element_types: FplPosition[];
}

interface FplPlayer {
  id: number;
  code: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  selected_by_percent: string;
  total_points: number;
  event_points: number;
  form: string;
  ict_index: string;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  yellow_cards: number;
  red_cards: number;
  bonus: number;
  bps: number;
  transfers_in: number;
  transfers_in_event: number;
  transfers_out: number;
  transfers_out_event: number;
  value_form: string;
  value_season: string;
  points_per_game: string;
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
  news: string;
  news_added: string | null;
  photo: string;
}

interface FplTeam {
  id: number;
  name: string;
  short_name: string;
}

interface FplPosition {
  id: number;
  singular_name: string;
  singular_name_short: string;
  plural_name: string;
  plural_name_short: string;
}

interface PlayerSummary {
  fixtures: PlayerFixture[];
  history: PlayerHistory[];
  history_past: PlayerPastHistory[];
}

interface PlayerFixture {
  id: number;
  event: number;
  is_home: boolean;
  difficulty: number;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  kickoff_time: string;
  code: number;
  finished: boolean;
  minutes: number;
  provisional_start_time: boolean;
  event_name: string;
}

interface PlayerHistory {
  element: number;
  fixture: number;
  opponent_team: number;
  total_points: number;
  was_home: boolean;
  kickoff_time: string;
  team_h_score: number;
  team_a_score: number;
  round: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  value: number;
  selected: number;
}

interface PlayerPastHistory {
  season_name: string;
  element_code: number;
  start_cost: number;
  end_cost: number;
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
}

// Player data interface
interface PlayerData {
  id: number;
  code: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  team_name?: string;
  team_short_name?: string;
  element_type: number;
  position?: string;
  position_short?: string;
  now_cost: number;
  price?: number;
  selected_by_percent: number;
  ownership?: number;
  total_points: number;
  event_points: number;
  form: string;
  form_numeric?: number;
  xG?: number;
  xA?: number;
  ict_index: string;
  ict_index_numeric?: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  yellow_cards: number;
  red_cards: number;
  bonus: number;
  bps: number;
  transfers_in: number;
  transfers_in_event: number;
  transfers_out: number;
  transfers_out_event: number;
  value_form: string;
  value_season: string;
  points_per_game: string;
  ppg_numeric?: number;
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
  status?: string;
  news: string;
  news_added: string | null;
  photo?: string;
  image_url?: string;
  fixtures?: PlayerFixture[];
  history?: PlayerHistory[];
  history_past?: PlayerPastHistory[];
}

// Mock team data - we'll keep this as a fallback
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

// Position mapping - we'll keep this as a fallback
const positionMapping = [
  { id: 1, singular_name: 'Goalkeeper', singular_name_short: 'GKP', plural_name: 'Goalkeepers', plural_name_short: 'GKP' },
  { id: 2, singular_name: 'Defender', singular_name_short: 'DEF', plural_name: 'Defenders', plural_name_short: 'DEF' },
  { id: 3, singular_name: 'Midfielder', singular_name_short: 'MID', plural_name: 'Midfielders', plural_name_short: 'MID' },
  { id: 4, singular_name: 'Forward', singular_name_short: 'FWD', plural_name: 'Forwards', plural_name_short: 'FWD' },
];

// Sort config interface
interface SortConfig {
  key: keyof PlayerData;
  direction: 'asc' | 'desc';
}

// Filter options interface
interface FilterOptions {
  position: number | null;
  team: number | null;
  priceRange: [number, number];
  minPoints: number;
  maxPrice: number;
  searchTerm: string;
  statusFilter: string;
}

// Process player data to add derived fields
const processPlayers = (players: FplPlayer[], teams: FplTeam[], positions: FplPosition[]): PlayerData[] => {
  return players.map(player => ({
    ...player,
    team_name: teams.find(t => t.id === player.team)?.name || 'Unknown',
    team_short_name: teams.find(t => t.id === player.team)?.short_name || 'UNK',
    position: positions.find(p => p.id === player.element_type)?.singular_name || 'Unknown',
    position_short: positions.find(p => p.id === player.element_type)?.singular_name_short || 'UNK',
    price: player.now_cost / 10,
    ownership: parseFloat(player.selected_by_percent),
    form_numeric: parseFloat(player.form),
    ppg_numeric: parseFloat(player.points_per_game),
    ict_index_numeric: parseFloat(player.ict_index),
    status: getPlayerStatus(player),
    selected_by_percent: parseFloat(player.selected_by_percent),
    image_url: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.id}.png`
  }));
};

// Get player status based on chance of playing
const getPlayerStatus = (player: PlayerData | FplPlayer): string => {
  if (player.chance_of_playing_next_round === 0) return 'Unavailable';
  if (player.chance_of_playing_next_round !== null && player.chance_of_playing_next_round < 100) return 'Doubtful';
  if (player.news) return 'News';
  return 'Available';
};

// Add a mock data generator to use as fallback
const generateMockPlayers = (count: number): PlayerData[] => {
  const players: PlayerData[] = [];
  
  for (let i = 1; i <= count; i++) {
    const teamId = Math.floor(Math.random() * 20) + 1;
    const positionId = Math.floor(Math.random() * 4) + 1;
    const price = (Math.floor(Math.random() * 130) + 40) / 10;
    const form = (Math.random() * 10).toFixed(1);
    const ict = (Math.random() * 100).toFixed(1);
    const ppg = (Math.random() * 10).toFixed(1);
    
    players.push({
      id: i,
      code: 10000 + i,
      web_name: `Player ${i}`,
      first_name: `First ${i}`,
      second_name: `Last ${i}`,
      team: teamId,
      element_type: positionId,
      now_cost: price * 10,
      selected_by_percent: Math.random() * 50,
      total_points: Math.floor(Math.random() * 200),
      event_points: Math.floor(Math.random() * 20),
      form: form,
      form_numeric: parseFloat(form),
      ict_index: ict,
      ict_index_numeric: parseFloat(ict),
      minutes: Math.floor(Math.random() * 2000),
      goals_scored: Math.floor(Math.random() * 20),
      assists: Math.floor(Math.random() * 15),
      clean_sheets: Math.floor(Math.random() * 10),
      goals_conceded: Math.floor(Math.random() * 30),
      yellow_cards: Math.floor(Math.random() * 5),
      red_cards: Math.floor(Math.random() * 2),
      bonus: Math.floor(Math.random() * 20),
      bps: Math.floor(Math.random() * 600),
      transfers_in: Math.floor(Math.random() * 500000),
      transfers_in_event: Math.floor(Math.random() * 50000),
      transfers_out: Math.floor(Math.random() * 500000),
      transfers_out_event: Math.floor(Math.random() * 50000),
      value_form: (Math.random() * 1).toFixed(1),
      value_season: (Math.random() * 20).toFixed(1),
      points_per_game: ppg,
      ppg_numeric: parseFloat(ppg),
      chance_of_playing_next_round: Math.random() > 0.8 ? Math.random() * 100 : 100,
      chance_of_playing_this_round: Math.random() > 0.8 ? Math.random() * 100 : 100,
      news: Math.random() > 0.8 ? "Minor injury - 75% chance of playing" : "",
      news_added: Math.random() > 0.8 ? new Date().toISOString() : null,
      xG: Math.random() * 10,
      xA: Math.random() * 8,
    });
  }
  
  return players;
};

// Process mock players
const processMockPlayers = (players: PlayerData[]): PlayerData[] => {
  return players.map(player => {
    const teamData = teams.find(t => t.id === player.team);
    const positionData = positionMapping.find(p => p.id === player.element_type);
    
    return {
      ...player,
      team_name: teamData?.name || 'Unknown',
      team_short_name: teamData?.short_name || 'UNK',
      position: positionData?.singular_name || 'Unknown',
      position_short: positionData?.singular_name_short || 'UNK',
      status: getPlayerStatus(player),
      image_url: `/player-placeholder-${player.element_type}.png` // Fallback image path
    };
  });
};

export default function PlayerList() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [teams, setTeams] = useState<FplTeam[]>([]);
  const [positions, setPositions] = useState<FplPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'total_points', direction: 'desc' });
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [playerSummary, setPlayerSummary] = useState<PlayerSummary | null>(null);
  const [loadingPlayerSummary, setLoadingPlayerSummary] = useState(false);
  const [playerSummaryError, setPlayerSummaryError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'history'>('overview');
  const [filters, setFilters] = useState<FilterOptions>({
    position: null,
    team: null,
    priceRange: [0, 15],
    minPoints: 0,
    maxPrice: 15,
    searchTerm: '',
    statusFilter: 'all'
  });
  const router = useRouter();

  // Load player data on component mount
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        console.log('Fetching players data from API...');
        const response = await axios.get<FplApiResponse>('/api/fpl/players');
        
        console.log('API response status:', response.status);
        
        if (response.status !== 200) {
          throw new Error(`Error fetching players: ${response.status}`);
        }
        
        if (!response.data || !response.data.elements || !Array.isArray(response.data.elements)) {
          console.error('Invalid response structure:', response.data);
          throw new Error('Invalid API response structure');
        }
        
        const { elements, teams, element_types } = response.data;
        console.log(`Received data: ${elements.length} players, ${teams.length} teams, ${element_types.length} positions`);
        
        setTeams(teams);
        setPositions(element_types);
        
        try {
          const processedPlayers = processPlayers(elements, teams, element_types);
          console.log('Processed players:', processedPlayers.length);
          setPlayers(processedPlayers);
        } catch (processingError: any) {
          console.error('Error processing players:', processingError);
          throw new Error(`Error processing player data: ${processingError.message}`);
        }
        
      } catch (err: any) {
        console.error('Error fetching players:', err);
        console.log('Error details:', err.response?.data || err.message);
        console.log('Falling back to mock data...');
        setError('Failed to fetch player data: ' + (err.message || 'Unknown error') + '. Using mock data instead.');
        
        // Use mock data as fallback
        try {
          console.log('Generating mock data...');
          const mockPlayers = generateMockPlayers(200);
          console.log('Processing mock data...');
          const processedMockPlayers = processMockPlayers(mockPlayers);
          console.log('Mock data ready, setting players state');
          setPlayers(processedMockPlayers);
        } catch (mockErr: any) {
          console.error('Error generating mock data:', mockErr);
          setError('Failed to generate mock data. Please refresh the page to try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayers();
  }, []);

  // Fetch player summary when a player is selected
  useEffect(() => {
    if (!selectedPlayer) {
      setPlayerSummary(null);
      return;
    }
    
    const fetchPlayerSummary = async () => {
      setLoadingPlayerSummary(true);
      setPlayerSummaryError(null);
      try {
        const response = await axios.get<PlayerSummary>(`/api/fpl/player-summary/${selectedPlayer.id}`);
        
        if (response.status !== 200) {
          throw new Error(`Error fetching player summary: ${response.status}`);
        }
        
        // Validate response data
        if (!response.data || (!response.data.fixtures && !response.data.history)) {
          throw new Error('Invalid player summary data received');
        }
        
        setPlayerSummary(response.data);
        
        // Update selected player with summary data
        setSelectedPlayer(prev => {
          if (!prev) return null;
          return {
            ...prev,
            fixtures: response.data.fixtures,
            history: response.data.history,
            history_past: response.data.history_past
          };
        });
      } catch (err: any) {
        console.error(`Error fetching player summary for player ID ${selectedPlayer.id}:`, err);
        setPlayerSummaryError(err.message || 'Failed to load player statistics');
        
        // Generate mock data as fallback
        try {
          const mockFixtures = Array(5).fill(0).map((_, i) => ({
            id: i + 1,
            team_h: Math.floor(Math.random() * 20) + 1,
            team_a: Math.floor(Math.random() * 20) + 1,
            team_h_score: null,
            team_a_score: null,
            event: i + 1,
            kickoff_time: new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
            is_home: i % 2 === 0,
            difficulty: Math.floor(Math.random() * 5) + 1,
            finished: false,
            minutes: 0,
            provisional_start_time: false,
            event_name: `Gameweek ${i + 1}`,
            code: 1000000 + i
          }));
          
          const mockHistory = Array(5).fill(0).map((_, i) => ({
            element: selectedPlayer.id,
            fixture: i + 1,
            opponent_team: Math.floor(Math.random() * 20) + 1,
            total_points: Math.floor(Math.random() * 15),
            was_home: i % 2 === 0,
            kickoff_time: new Date(Date.now() - ((i + 1) * 7 * 24 * 60 * 60 * 1000)).toISOString(),
            team_h_score: Math.floor(Math.random() * 5),
            team_a_score: Math.floor(Math.random() * 5),
            round: 38 - i,
            minutes: Math.floor(Math.random() * 90) + 1,
            goals_scored: Math.floor(Math.random() * 3),
            assists: Math.floor(Math.random() * 3),
            clean_sheets: Math.floor(Math.random() * 2),
            goals_conceded: Math.floor(Math.random() * 4),
            own_goals: 0,
            penalties_saved: 0,
            penalties_missed: 0,
            yellow_cards: Math.floor(Math.random() * 2),
            red_cards: 0,
            saves: 0,
            bonus: Math.floor(Math.random() * 4),
            bps: Math.floor(Math.random() * 100),
            influence: (Math.random() * 100).toFixed(1),
            creativity: (Math.random() * 100).toFixed(1),
            threat: (Math.random() * 100).toFixed(1),
            ict_index: (Math.random() * 10).toFixed(1),
            value: selectedPlayer.now_cost,
            transfers_balance: 0,
            selected: 0,
            transfers_in: 0,
            transfers_out: 0
          }));
          
          const mockData: PlayerSummary = {
            fixtures: mockFixtures,
            history: mockHistory,
            history_past: []
          };
          
          setPlayerSummary(mockData);
          
          // Update selected player with mock data
          setSelectedPlayer(prev => {
            if (!prev) return null;
            return {
              ...prev,
              fixtures: mockFixtures,
              history: mockHistory,
              history_past: []
            };
          });
          
          console.log('Using mock player summary data as fallback');
        } catch (mockErr: any) {
          console.error('Failed to generate mock data:', mockErr);
        }
      } finally {
        setLoadingPlayerSummary(false);
      }
    };
    
    fetchPlayerSummary();
  }, [selectedPlayer?.id]);

  // Sort and filter players
  const sortedAndFilteredPlayers = useMemo(() => {
    // Filter players
    let result = [...players];
    
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(player => 
        player.web_name.toLowerCase().includes(searchLower) ||
        player.first_name.toLowerCase().includes(searchLower) ||
        player.second_name.toLowerCase().includes(searchLower) ||
        `${player.first_name} ${player.second_name}`.toLowerCase().includes(searchLower) ||
        player.team_name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Position filter
    if (filters.position !== null) {
      result = result.filter(player => player.element_type === filters.position);
    }
    
    // Team filter
    if (filters.team !== null) {
      result = result.filter(player => player.team === filters.team);
    }
    
    // Price range filter
    result = result.filter(player => 
      player.price! >= filters.priceRange[0] && 
      player.price! <= filters.priceRange[1]
    );
    
    // Points filter
    if (filters.minPoints > 0) {
      result = result.filter(player => player.total_points >= filters.minPoints);
    }
    
    // Status filter
    if (filters.statusFilter !== 'all') {
      if (filters.statusFilter === 'available') {
        result = result.filter(player => player.status === 'Available');
      } else if (filters.statusFilter === 'doubtful') {
        result = result.filter(player => player.status === 'Doubtful');
      } else if (filters.statusFilter === 'unavailable') {
        result = result.filter(player => player.status === 'Unavailable');
      }
    }
    
    // Sort players
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      // Handle numeric string comparisons
      if (typeof aValue === 'string' && !isNaN(parseFloat(aValue)) && 
          typeof bValue === 'string' && !isNaN(parseFloat(bValue))) {
        return sortConfig.direction === 'asc' 
          ? parseFloat(aValue) - parseFloat(bValue)
          : parseFloat(bValue) - parseFloat(aValue);
      }
      
      // Handle regular string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle number comparisons
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Fallback
      return 0;
    });
    
    return result;
  }, [players, sortConfig, filters]);

  // Request sort for a column
  const requestSort = (key: keyof PlayerData) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction for a column
  const getSortDirection = (key: keyof PlayerData) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction;
  };

  // Get sort icon for a column
  const getSortIcon = (key: keyof PlayerData) => {
    const direction = getSortDirection(key);
    if (!direction) return <FaSort className="ml-1 text-gray-400" />;
    return direction === 'asc' ? <FaSortUp className="ml-1 text-fpl-green" /> : <FaSortDown className="ml-1 text-fpl-green" />;
  };

  // Replace the selectPlayer function with this one to navigate to player detail
  const selectPlayer = (player: PlayerData) => {
    console.log('Navigating to player details:', player.id, player.web_name);
    router.push(`/players/${player.id}`);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  // Handle price range change
  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], value] }));
  };

  // Handle min price change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setFilters(prev => ({ ...prev, priceRange: [value, prev.priceRange[1]] }));
  };

  // Handle min points change
  const handleMinPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setFilters(prev => ({ ...prev, minPoints: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      position: null,
      team: null,
      priceRange: [0, 15],
      minPoints: 0,
      maxPrice: 15,
      searchTerm: '',
      statusFilter: 'all'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-fpl-green">Player Statistics</h2>
      
      {/* Filters */}
      <div className="mb-6 bg-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-[200px] relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search players..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-fpl-green"
              value={filters.searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div>
            <select
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-fpl-green"
              value={filters.position === null ? '' : filters.position}
              onChange={(e) => setFilters({ ...filters, position: e.target.value ? parseInt(e.target.value) : null })}
            >
              <option value="">All Positions</option>
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>{pos.singular_name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-fpl-green"
              value={filters.team === null ? '' : filters.team}
              onChange={(e) => setFilters({ ...filters, team: e.target.value ? parseInt(e.target.value) : null })}
            >
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-fpl-green"
              value={filters.statusFilter}
              onChange={(e) => setFilters({ ...filters, statusFilter: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="doubtful">Doubtful</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6">
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-1">Min Price: £{filters.priceRange[0]}m</label>
            <input
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={filters.priceRange[0]}
              onChange={handleMinPriceChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-1">Max Price: £{filters.priceRange[1]}m</label>
            <input
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={filters.priceRange[1]}
              onChange={handlePriceRangeChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-1">Min Points: {filters.minPoints}</label>
            <input
              type="range"
              min="0"
              max="300"
              step="5"
              value={filters.minPoints}
              onChange={handleMinPointsChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Loading/Error States */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-fpl-green text-4xl" />
        </div>
      )}
      
      {error && !loading && (
        <div className="p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-md text-red-400 mb-6">
          {error}
        </div>
      )}
      
      {/* Player Table */}
      {!loading && !error && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Players ({sortedAndFilteredPlayers.length})</h2>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 text-left">
                <tr>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('web_name')}
                  >
                    <div className="flex items-center">
                      Player
                      {getSortIcon('web_name')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('team')}
                  >
                    <div className="flex items-center">
                      Team
                      {getSortIcon('team')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('element_type')}
                  >
                    <div className="flex items-center">
                      Pos
                      {getSortIcon('element_type')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      {getSortIcon('price')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('selected_by_percent')}
                  >
                    <div className="flex items-center">
                      Own%
                      {getSortIcon('selected_by_percent')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('form')}
                  >
                    <div className="flex items-center">
                      Form
                      {getSortIcon('form')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('points_per_game')}
                  >
                    <div className="flex items-center">
                      PPG
                      {getSortIcon('points_per_game')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('total_points')}
                  >
                    <div className="flex items-center">
                      Pts
                      {getSortIcon('total_points')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('minutes')}
                  >
                    <div className="flex items-center">
                      Mins
                      {getSortIcon('minutes')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('goals_scored')}
                  >
                    <div className="flex items-center">
                      G
                      {getSortIcon('goals_scored')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('assists')}
                  >
                    <div className="flex items-center">
                      A
                      {getSortIcon('assists')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 cursor-pointer hover:bg-gray-750" 
                    onClick={() => requestSort('bonus')}
                  >
                    <div className="flex items-center">
                      Bonus
                      {getSortIcon('bonus')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredPlayers.map(player => (
                  <tr 
                    key={player.id} 
                    className="border-b border-gray-700 hover:bg-gray-750 cursor-pointer"
                    onClick={() => selectPlayer(player)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 mr-3 relative overflow-hidden rounded-full bg-gray-700">
                          <PlayerImage 
                            playerId={player.id}
                            playerName={player.web_name}
                            positionShort={player.position_short}
                            size="small"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{player.web_name}</div>
                          {player.news && (
                            <div className="text-xs mt-1 text-red-400">{player.news}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{player.team_short_name}</td>
                    <td className="py-3 px-4">{player.position_short}</td>
                    <td className="py-3 px-4">£{player.price?.toFixed(1)}m</td>
                    <td className="py-3 px-4">{player.selected_by_percent}%</td>
                    <td className="py-3 px-4">{player.form}</td>
                    <td className="py-3 px-4">{player.points_per_game}</td>
                    <td className="py-3 px-4">{player.total_points}</td>
                    <td className="py-3 px-4">{player.minutes}</td>
                    <td className="py-3 px-4">{player.goals_scored}</td>
                    <td className="py-3 px-4">{player.assists}</td>
                    <td className="py-3 px-4">{player.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 