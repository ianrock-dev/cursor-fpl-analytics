import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { getPlayerBioFromFBRef, PlayerBio } from '@/utils/fbref';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    try {
        // Check cache first
        const { data: cachedBio, error: cacheError } = await supabase
            .from('player_bios')
            .select('*')
            .eq('player_name', name)
            .single();

        if (cachedBio) {
            // If data is less than 7 days old, return cached version
            const lastUpdated = new Date(cachedBio.last_updated);
            const now = new Date();
            const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

            if (daysSinceUpdate < 7) {
                return NextResponse.json(cachedBio);
            }
        }

        // Fetch fresh data from FBRef
        const bioData = await getPlayerBioFromFBRef(name);
        
        if (!bioData) {
            return NextResponse.json(
                { error: 'Player not found on FBRef' },
                { status: 404 }
            );
        }

        // Update cache
        const { error: upsertError } = await supabase
            .from('player_bios')
            .upsert({
                ...bioData,
                last_updated: new Date().toISOString()
            });

        if (upsertError) {
            console.error('Error updating cache:', upsertError);
        }

        return NextResponse.json(bioData);
    } catch (error) {
        console.error('Error in bio route:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 