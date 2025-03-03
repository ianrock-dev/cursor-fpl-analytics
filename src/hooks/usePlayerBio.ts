import { useState, useEffect } from 'react';
import { PlayerBio, getPlayerBioFromFBRef } from '@/utils/fbref';
import { supabase } from '@/utils/supabase';

export function usePlayerBio(playerName: string | null) {
    const [bio, setBio] = useState<PlayerBio | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchBio() {
            if (!playerName) {
                setBio(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Check cache first
                const { data: cachedBio, error: cacheError } = await supabase
                    .from('player_bios')
                    .select('*')
                    .eq('player_name', playerName)
                    .single();

                if (cachedBio) {
                    // If data is less than 7 days old, use cache
                    const lastUpdated = new Date(cachedBio.last_updated);
                    const now = new Date();
                    const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

                    if (daysSinceUpdate < 7) {
                        setBio(cachedBio);
                        setLoading(false);
                        return;
                    }
                }

                // Fetch fresh data from FBRef
                const bioData = await getPlayerBioFromFBRef(playerName);
                
                if (!bioData) {
                    throw new Error('Player not found on FBRef');
                }

                // Update cache
                const { error: upsertError } = await supabase
                    .from('player_bios')
                    .upsert({
                        ...bioData,
                        last_updated: new Date().toISOString()
                    });

                if (upsertError) {
                    console.error('Error updating bio cache:', upsertError);
                }

                setBio(bioData);
            } catch (err) {
                console.error('Error fetching player bio:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch player bio');
                setBio(null);
            } finally {
                setLoading(false);
            }
        }

        fetchBio();
    }, [playerName]);

    return { bio, loading, error };
} 