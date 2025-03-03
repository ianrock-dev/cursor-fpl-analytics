import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { supabase } from '@/utils/supabase';

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const BASE_URL = 'https://fbref.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerName = searchParams.get('name');

  if (!playerName) {
    return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
  }

  try {
    // Check cache first
    const { data: cachedData } = await supabase
      .from('player_stats')
      .select('*')
      .eq('name', playerName)
      .single();

    if (cachedData) {
      const lastUpdated = new Date(cachedData.last_updated).getTime();
      const now = new Date().getTime();
      
      if (now - lastUpdated < CACHE_DURATION) {
        return NextResponse.json(cachedData);
      }
    }

    // Search for player
    const searchUrl = `${BASE_URL}/en/search/search.fcgi?search=${encodeURIComponent(playerName)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FootballAnalytics/1.0)',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Failed to search for player: ${searchResponse.statusText}`);
    }

    const searchHtml = await searchResponse.text();
    const $ = cheerio.load(searchHtml);

    // Find the first player result
    const playerLink = $('div.search-item-name')
      .filter((_, el) => $(el).text().toLowerCase().includes('page'))
      .first()
      .find('a');

    if (playerLink.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const playerUrl = playerLink.attr('href');
    if (!playerUrl) {
      return NextResponse.json({ error: 'Player URL not found' }, { status: 404 });
    }

    // Fetch player stats
    const statsResponse = await fetch(`${BASE_URL}${playerUrl}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FootballAnalytics/1.0)',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!statsResponse.ok) {
      throw new Error(`Failed to fetch player stats: ${statsResponse.statusText}`);
    }

    const statsHtml = await statsResponse.text();
    const $stats = cheerio.load(statsHtml);
    
    // Parse player data
    const name = $stats('h1[itemprop="name"]').text().trim();
    const team = $stats('.header_info').find('a').first().text().trim();
    const position = $stats('.header_info').text().match(/Position:\s+([^\n]+)/)?.[1]?.trim() || '';

    // Parse statistics
    const standardStats = $stats('table#stats_standard_dom_lg').first();
    const lastRow = standardStats.find('tbody tr').last();
    const advancedStats = $stats('table#stats_gca_dom_lg').first();
    const advRow = advancedStats.find('tbody tr').last();
    const shootingStats = $stats('table#stats_shooting_dom_lg').first();
    const shootRow = shootingStats.find('tbody tr').last();
    const possessionStats = $stats('table#stats_possession_dom_lg').first();
    const possRow = possessionStats.find('tbody tr').last();

    const stats = {
      name,
      team,
      position,
      matches: parseInt(lastRow.find('td[data-stat="games"]').text()) || 0,
      starts: parseInt(lastRow.find('td[data-stat="games_starts"]').text()) || 0,
      minutes: parseInt(lastRow.find('td[data-stat="minutes"]').text()) || 0,
      goals: parseInt(lastRow.find('td[data-stat="goals"]').text()) || 0,
      assists: parseInt(lastRow.find('td[data-stat="assists"]').text()) || 0,
      xG: parseFloat(advRow.find('td[data-stat="xg"]').text()) || 0,
      xA: parseFloat(advRow.find('td[data-stat="xa"]').text()) || 0,
      shots: parseInt(shootRow.find('td[data-stat="shots"]').text()) || 0,
      shotsOnTarget: parseInt(shootRow.find('td[data-stat="shots_on_target"]').text()) || 0,
      progressiveCarries: parseInt(possRow.find('td[data-stat="carries_progressive"]').text()) || 0,
      progressivePasses: parseInt(possRow.find('td[data-stat="passes_progressive"]').text()) || 0,
      last_updated: new Date().toISOString()
    };

    // Cache the results
    await supabase
      .from('player_stats')
      .upsert({
        ...stats,
        id: playerUrl // Use the URL as a unique identifier
      }, {
        onConflict: 'id'
      });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching FBRef data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player statistics' },
      { status: 500 }
    );
  }
} 