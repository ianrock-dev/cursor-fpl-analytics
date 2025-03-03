import { supabase } from '@/utils/supabase';
import PlayerProfile from '@/components/PlayerProfile';
import { Suspense } from 'react';

interface PlayerDetailsProps {
    params: {
        id: string;
    };
}

async function getPlayerName(playerId: string) {
    const { data: player } = await supabase
        .from('players')
        .select('data')
        .eq('id', playerId)
        .single();

    return player?.data?.web_name || null;
}

export default async function PlayerDetailsPage({ params }: PlayerDetailsProps) {
    const playerName = await getPlayerName(params.id);

    if (!playerName) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">Player not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{playerName}</h1>
            
            {/* Player Bio */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Player Information</h2>
                <Suspense fallback={<div>Loading player bio...</div>}>
                    <PlayerProfile playerName={playerName} />
                </Suspense>
            </div>
            
            {/* Additional sections can be added here */}
        </div>
    );
} 