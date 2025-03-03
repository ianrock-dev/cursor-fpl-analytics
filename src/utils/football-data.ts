import axios, { AxiosError } from 'axios';

const BASE_URL = 'https://api.football-data.org/v4';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Improved types with more specific status options
export type MatchStatus = 
  | 'SCHEDULED' 
  | 'LIVE' 
  | 'IN_PLAY' 
  | 'PAUSED' 
  | 'FINISHED' 
  | 'POSTPONED' 
  | 'SUSPENDED' 
  | 'CANCELLED';

export interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem?: string;
}

export interface TeamInfo {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest?: string;
}

export interface Score {
  winner: string | null;
  duration: string;
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime: {
    home: number | null;
    away: number | null;
  };
}

export interface Match {
  id: number;
  competition: Competition;
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
  };
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  score: Score;
  status: MatchStatus;
  utcDate: string;
  matchday: number;
  stage: string;
  group: string | null;
}

export interface Player {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  position: string;
  shirtNumber?: number;
  currentTeam?: TeamInfo;
}

export interface Team extends TeamInfo {
  venue: string;
  coach?: {
    id: number;
    name: string;
    nationality: string;
  };
  squad: Player[];
  website?: string;
  founded?: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class FootballDataAPI {
  private static instance: FootballDataAPI;
  private apiKey: string;
  private cache: Map<string, CacheItem<any>>;

  private constructor() {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    if (!apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY is not configured');
    }
    this.apiKey = apiKey;
    this.cache = new Map();
  }

  public static getInstance(): FootballDataAPI {
    if (!FootballDataAPI.instance) {
      FootballDataAPI.instance = new FootballDataAPI();
    }
    return FootballDataAPI.instance;
  }

  private isCacheValid<T>(cacheItem: CacheItem<T> | undefined): boolean {
    if (!cacheItem) return false;
    return Date.now() - cacheItem.timestamp < CACHE_DURATION;
  }

  private async fetchWithCache<T>(endpoint: string): Promise<T> {
    const cachedItem = this.cache.get(endpoint) as CacheItem<T> | undefined;
    
    if (this.isCacheValid(cachedItem)) {
      return cachedItem.data;
    }

    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          'X-Auth-Token': this.apiKey
        }
      });

      const data = response.data;
      this.cache.set(endpoint, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  /**
   * Get matches for a specific competition
   * @param competitionId - The ID of the competition (e.g., 2021 for Premier League)
   */
  public async getMatches(competitionId?: number): Promise<Match[]> {
    const endpoint = competitionId 
      ? `/competitions/${competitionId}/matches`
      : '/matches';
    const response = await this.fetchWithCache<{ matches: Match[] }>(endpoint);
    return response.matches;
  }

  /**
   * Get team details including squad
   * @param teamId - The ID of the team
   */
  public async getTeam(teamId: number): Promise<Team> {
    const endpoint = `/teams/${teamId}`;
    return this.fetchWithCache<Team>(endpoint);
  }

  /**
   * Get player details
   * @param playerId - The ID of the player
   */
  public async getPlayer(playerId: number): Promise<Player> {
    const endpoint = `/players/${playerId}`;
    return this.fetchWithCache<Player>(endpoint);
  }

  /**
   * Search for a team
   * @param name - Team name to search for
   */
  public async searchTeam(name: string): Promise<Team[]> {
    const endpoint = `/teams?search=${encodeURIComponent(name)}`;
    const response = await this.fetchWithCache<{ teams: Team[] }>(endpoint);
    return response.teams;
  }

  /**
   * Get matches for a specific team
   * @param teamId - The ID of the team
   * @param status - Match status (SCHEDULED, LIVE, IN_PLAY, PAUSED, FINISHED, etc.)
   */
  public async getTeamMatches(teamId: number, status?: MatchStatus): Promise<Match[]> {
    const endpoint = `/teams/${teamId}/matches${status ? `?status=${status}` : ''}`;
    const response = await this.fetchWithCache<{ matches: Match[] }>(endpoint);
    return response.matches;
  }

  /**
   * Get match details
   * @param matchId - The ID of the match
   */
  public async getMatch(matchId: number): Promise<Match> {
    const endpoint = `/matches/${matchId}`;
    return this.fetchWithCache<Match>(endpoint);
  }

  // Clear the cache manually if needed
  public clearCache(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const footballData = FootballDataAPI.getInstance(); 