import { NextRequest, NextResponse } from 'next/server';
import { getPlayerFromCache } from '@/utils/supabase';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const playerId = params.id;
  
  try {
    // Try to fetch the player image from the Premier League API
    const urls = [
      `https://resources.premierleague.com/premierleague/photos/players/250x250/p${playerId}.png`,
      `https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/250x250/p${playerId}.png`,
      `https://resources.premierleague.com/premierleague/photos/players/110x140/p${playerId}.png`
    ];
    
    // Try each URL in order
    for (const url of urls) {
      try {
        const imageResponse = await fetch(url, { 
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          return new NextResponse(Buffer.from(imageBuffer), {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=86400'
            }
          });
        }
      } catch (error) {
        console.error(`Failed to fetch image from ${url}`, error);
      }
    }
    
    // If we get here, all URLs failed, so use a placeholder image
    // First, try to get player position to use position-specific placeholder
    let position = 'unknown';
    try {
      const playerData = await getPlayerFromCache(parseInt(playerId));
      if (playerData && playerData.data) {
        position = playerData.data.position_short?.toLowerCase() || 'unknown';
      }
    } catch (error) {
      console.error('Error fetching player data for placeholder:', error);
    }
    
    // Check if we have a position-specific placeholder
    const placeholderPath = path.join(process.cwd(), 'public', 'images', 'players', `placeholder-${position}.png`);
    const defaultPlaceholderPath = path.join(process.cwd(), 'public', 'images', 'players', 'placeholder.png');
    
    let imagePath;
    if (fs.existsSync(placeholderPath)) {
      imagePath = placeholderPath;
    } else if (fs.existsSync(defaultPlaceholderPath)) {
      imagePath = defaultPlaceholderPath;
    } else {
      // If no placeholder exists, return a 404
      return new NextResponse('Player image not found', { status: 404 });
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    console.error('Error in player image API:', error);
    return new NextResponse('Error fetching player image', { status: 500 });
  }
} 