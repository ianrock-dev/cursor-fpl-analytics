import { NextResponse } from 'next/server';
import { footballData } from '@/utils/football-data';
import { z } from 'zod';

// Input validation schemas
const querySchema = z.object({
  type: z.enum(['matches', 'team', 'player', 'team-matches', 'search-team', 'match']),
  id: z.string().optional(),
  status: z.enum(['SCHEDULED', 'LIVE', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'SUSPENDED', 'CANCELLED']).optional(),
  search: z.string().optional(),
});

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate input parameters
    const validatedParams = querySchema.safeParse(params);
    
    if (!validatedParams.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validatedParams.error.issues },
        { status: 400 }
      );
    }

    const { type, id, status, search } = validatedParams.data;
    let data;

    switch (type) {
      case 'matches':
        data = await footballData.getMatches(id ? parseInt(id) : undefined);
        break;
        
      case 'match':
        if (!id) {
          return NextResponse.json(
            { error: 'Match ID is required' },
            { status: 400 }
          );
        }
        data = await footballData.getMatch(parseInt(id));
        break;
        
      case 'team':
        if (!id) {
          return NextResponse.json(
            { error: 'Team ID is required' },
            { status: 400 }
          );
        }
        data = await footballData.getTeam(parseInt(id));
        break;
        
      case 'player':
        if (!id) {
          return NextResponse.json(
            { error: 'Player ID is required' },
            { status: 400 }
          );
        }
        data = await footballData.getPlayer(parseInt(id));
        break;
        
      case 'team-matches':
        if (!id) {
          return NextResponse.json(
            { error: 'Team ID is required' },
            { status: 400 }
          );
        }
        data = await footballData.getTeamMatches(parseInt(id), status);
        break;
        
      case 'search-team':
        if (!search) {
          return NextResponse.json(
            { error: 'Search term is required' },
            { status: 400 }
          );
        }
        data = await footballData.searchTeam(search);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    
    const statusCode = error instanceof Error && 
      error.message.includes('Rate limit') ? 429 : 500;
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
} 