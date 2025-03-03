import { NextResponse } from 'next/server';
import { getCompetitions } from '@/utils/statsbomb';

export async function GET() {
  try {
    const competitions = await getCompetitions();
    
    // Filter to include only relevant competitions (e.g., Premier League)
    const filteredCompetitions = competitions.filter(comp => 
      comp.competition_name.includes('Premier League') || 
      comp.competition_name.includes('La Liga') ||
      comp.competition_name.includes('Serie A') ||
      comp.competition_name.includes('Bundesliga') ||
      comp.competition_name.includes('Champions League')
    );
    
    return NextResponse.json({
      status: 'success',
      data: filteredCompetitions,
      attribution: 'Data provided by StatsBomb'
    });
  } catch (error) {
    console.error('Error fetching StatsBomb competitions:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch competitions',
      },
      { status: 500 }
    );
  }
} 