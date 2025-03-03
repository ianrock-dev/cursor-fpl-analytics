import { NextResponse } from 'next/server';
import axios from 'axios';
import { getPlayerSummaryFromCache, cachePlayerSummary } from '@/utils/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    
    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }
    
    // Try to get data from cache first
    const cachedData = await getPlayerSummaryFromCache(Number(playerId));
    
    if (cachedData) {
      console.log(`Using cached summary data for player ${playerId}`);
      return NextResponse.json(cachedData);
    }
    
    // If not in cache, fetch from FPL API
    console.log(`Fetching fresh summary data for player ${playerId} from FPL API`);
    const response = await axios.get(`https://fantasy.premierleague.com/api/element-summary/${playerId}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
      },
      timeout: 10000,
    });
    
    if (response.status !== 200) {
      throw new Error(`Error fetching data: ${response.status}`);
    }
    
    const data = response.data;
    
    // Cache the response for future requests
    await cachePlayerSummary(Number(playerId), data);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in player-summary API:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch player summary data' }, 
      { status: 500 }
    );
  }
} 