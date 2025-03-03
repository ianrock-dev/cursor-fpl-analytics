import { useState, useEffect, useCallback } from 'react';
import { Match, Team, Player, MatchStatus } from '@/utils/football-data';

type RequestType = 'matches' | 'team' | 'player' | 'team-matches' | 'search-team' | 'match';

interface UseFootballDataOptions {
  type: RequestType;
  id?: number;
  status?: MatchStatus;
  search?: string;
  enabled?: boolean;
}

interface UseFootballDataResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

export function useFootballData<T>({ 
  type, 
  id, 
  status, 
  search,
  enabled = true 
}: UseFootballDataOptions): UseFootballDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        type,
        ...(id && { id: id.toString() }),
        ...(status && { status }),
        ...(search && { search })
      });

      const response = await fetch(`/api/football-data?${params}`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || `HTTP error! status: ${response.status}`);
      }

      setData(json.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [type, id, status, search, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    error, 
    isLoading,
    isError: error !== null,
    refetch: fetchData
  };
}

// Convenience hooks with proper typing
export function useMatches(competitionId?: number, enabled = true) {
  return useFootballData<Match[]>({ 
    type: 'matches',
    id: competitionId,
    enabled
  });
}

export function useTeam(teamId: number, enabled = true) {
  return useFootballData<Team>({ 
    type: 'team',
    id: teamId,
    enabled
  });
}

export function usePlayer(playerId: number, enabled = true) {
  return useFootballData<Player>({ 
    type: 'player',
    id: playerId,
    enabled
  });
}

export function useTeamMatches(teamId: number, status?: MatchStatus, enabled = true) {
  return useFootballData<Match[]>({ 
    type: 'team-matches',
    id: teamId,
    status,
    enabled
  });
}

export function useTeamSearch(searchTerm: string, enabled = true) {
  return useFootballData<Team[]>({ 
    type: 'search-team',
    search: searchTerm,
    enabled
  });
}

export function useMatch(matchId: number, enabled = true) {
  return useFootballData<Match>({ 
    type: 'match',
    id: matchId,
    enabled
  });
} 