import { NextRequest, NextResponse } from 'next/server';
import { getMatches } from '@/utils/statsbomb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const competitionId = searchParams.get('competitionId');
    const seasonId = searchParams.get('seasonId');
    
    if (!competitionId || !seasonId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required parameters: competitionId and seasonId',
        },
        { status: 400 }
      );
    }
    
    const matches = await getMatches(parseInt(competitionId), parseInt(seasonId));
    
    return NextResponse.json({
      status: 'success',
      data: matches,
      attribution: 'Data provided by StatsBomb'
    });
  } catch (error) {
    console.error('Error fetching StatsBomb matches:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch matches',
      },
      { status: 500 }
    );
  }
} 