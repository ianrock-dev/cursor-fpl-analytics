import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    // Add a user agent to mimic a browser request
    const response = await axios.get(`https://fantasy.premierleague.com/api/my-team/${id}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching FPL team info data:', error.message);
    
    // Return detailed error information for debugging
    return NextResponse.json(
      { 
        error: 'Failed to fetch team info data',
        message: error.message,
        status: error.response?.status || 500
      },
      { status: error.response?.status || 500 }
    );
  }
} 