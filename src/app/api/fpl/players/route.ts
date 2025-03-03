import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAllPlayersFromCache, cacheAllPlayers, cachePlayer } from '@/utils/supabase';
import { supabase } from '@/utils/supabase';

export async function GET() {
  try {
    // Try to get data from cache first
    const cachedData = await getAllPlayersFromCache();
    
    if (cachedData) {
      console.log('Using cached player data');
      return NextResponse.json(cachedData);
    }
    
    // If not in cache, fetch from FPL API
    console.log('Fetching fresh player data from FPL API');
    const response = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
      },
      timeout: 10000,
    });
    
    if (response.status !== 200) {
      throw new Error(`Error fetching data: ${response.status}`);
    }
    
    const data = response.data;
    
    // Cache the entire bootstrap static data
    await cacheAllPlayers(data);
    
    // Also cache individual player data for faster lookups
    if (data.elements && Array.isArray(data.elements)) {
      console.log(`Caching ${data.elements.length} individual players`);
      
      // Cache all players in batches to avoid overwhelming the database
      const batchSize = 50;
      const totalPlayers = data.elements.length;
      let processedCount = 0;
      
      for (let i = 0; i < totalPlayers; i += batchSize) {
        const batch = data.elements.slice(i, i + batchSize);
        const playerBatch = batch.map((player: any) => ({
          id: player.id,
          data: player,
          last_updated: new Date().toISOString()
        }));
        
        try {
          const { error: batchError } = await supabase
            .from('players')
            .upsert(playerBatch, { onConflict: 'id' });
          
          if (batchError) {
            console.error(`Error caching players batch ${i}-${i + batch.length}:`, batchError);
          } else {
            processedCount += batch.length;
            console.log(`Cached players ${i + 1}-${i + batch.length} (${processedCount}/${totalPlayers})`);
          }
        } catch (err) {
          console.error(`Exception caching players batch ${i}-${i + batch.length}:`, err);
        }
        
        // Add a small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in players API:', error.message);
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 });
  }
} 