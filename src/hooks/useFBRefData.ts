import { useState, useEffect } from 'react';

export interface FBRefStats {
  name: string;
  team: string;
  position: string;
  matches: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  xG: number;
  xA: number;
  shots: number;
  shotsOnTarget: number;
  progressiveCarries: number;
  progressivePasses: number;
  last_updated: string;
}

interface UseFBRefDataReturn {
  fbrefStats: FBRefStats | null;
  isLoading: boolean;
  error: Error | null;
}

export function useFBRefData(playerName: string): UseFBRefDataReturn {
  const [fbrefStats, setFbrefStats] = useState<FBRefStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFBRefData = async () => {
      if (!playerName) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/fbref?name=${encodeURIComponent(playerName)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch FBRef data: ${response.statusText}`);
        }

        const data = await response.json();
        setFbrefStats(data);
      } catch (err) {
        console.error('Error fetching FBRef data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch FBRef data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFBRefData();
  }, [playerName]);

  return { fbrefStats, isLoading, error };
}

// Helper function to combine FPL and FBRef data
export function combinePlayerData<T extends { web_name?: string; name?: string }>(
  fplData: T,
  fbrefStats: FBRefStats | null
): T & Partial<FBRefStats> {
  if (!fbrefStats) return fplData;

  return {
    ...fplData,
    fbref_matches: fbrefStats.matches,
    fbref_goals: fbrefStats.goals,
    fbref_assists: fbrefStats.assists,
    fbref_xG: fbrefStats.xG,
    fbref_xA: fbrefStats.xA,
    fbref_shots: fbrefStats.shots,
    fbref_shots_on_target: fbrefStats.shotsOnTarget,
    fbref_progressive_carries: fbrefStats.progressiveCarries,
    fbref_progressive_passes: fbrefStats.progressivePasses,
  };
} 