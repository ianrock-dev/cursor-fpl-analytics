import * as cheerio from 'cheerio';
import { supabase } from './supabase';
import axios, { AxiosError } from 'axios';

// Types
export interface PlayerBio {
    player_name: string;
    full_name: string;
    position: string;
    foot: string;
    height: string;
    weight: string;
    birth_date: string;
    birth_place?: string;
    nationality?: string;
    current_club?: string;
}

export interface PlayerStats {
  name: string;
  id: string;
  team: string;
  position: string;
  matches: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  xG: number;
  xA: number;
  progressiveCarries: number;
  progressivePasses: number;
  shots: number;
  shotsOnTarget: number;
  lastUpdated: string;
}

class FBRefError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FBRefError';
  }
}

export class FBRefAPI {
  private static readonly BASE_URL = 'https://fbref.com';
  private static readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  /**
   * Fetches HTML content from FBRef with appropriate headers and delay
   */
  private static async fetchWithDelay(url: string): Promise<string> {
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FootballAnalytics/1.0)',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      throw new FBRefError(`Failed to fetch from FBRef: ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Gets player statistics from cache or fetches from FBRef
   */
  public static async getPlayerStats(playerUrl: string): Promise<PlayerStats> {
    // Check cache first
    const { data: cachedData } = await supabase
      .from('player_stats')
      .select('*')
      .eq('id', playerUrl)
      .single();

    if (cachedData) {
      const lastUpdated = new Date(cachedData.lastUpdated).getTime();
      const now = new Date().getTime();
      
      if (now - lastUpdated < this.CACHE_DURATION) {
        console.log('Returning cached player stats');
        return cachedData as PlayerStats;
      }
    }

    // Fetch fresh data
    try {
      const html = await this.fetchWithDelay(`${this.BASE_URL}${playerUrl}`);
      const stats = await this.parsePlayerStats(html, playerUrl);
      
      // Cache the results
      await supabase
        .from('player_stats')
        .upsert({
          ...stats,
          lastUpdated: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      return stats;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw new FBRefError('Failed to fetch player statistics');
    }
  }

  /**
   * Parses player statistics from HTML content
   */
  private static async parsePlayerStats(html: string, playerId: string): Promise<PlayerStats> {
    const $ = cheerio.load(html);
    
    // Basic info
    const name = $('h1[itemprop="name"]').text().trim();
    const team = $('.header_info').find('a').first().text().trim();
    const position = $('.header_info').text().match(/Position:\s+([^\n]+)/)?.[1]?.trim() || '';

    // Stats from Standard Stats table
    const standardStats = $('table#stats_standard_dom_lg').first();
    const lastRow = standardStats.find('tbody tr').last();

    const matches = parseInt(lastRow.find('td[data-stat="games"]').text()) || 0;
    const starts = parseInt(lastRow.find('td[data-stat="games_starts"]').text()) || 0;
    const minutes = parseInt(lastRow.find('td[data-stat="minutes"]').text()) || 0;
    const goals = parseInt(lastRow.find('td[data-stat="goals"]').text()) || 0;
    const assists = parseInt(lastRow.find('td[data-stat="assists"]').text()) || 0;

    // Advanced Stats
    const advancedStats = $('table#stats_gca_dom_lg').first();
    const advRow = advancedStats.find('tbody tr').last();

    const xG = parseFloat(advRow.find('td[data-stat="xg"]').text()) || 0;
    const xA = parseFloat(advRow.find('td[data-stat="xa"]').text()) || 0;

    // Shooting Stats
    const shootingStats = $('table#stats_shooting_dom_lg').first();
    const shootRow = shootingStats.find('tbody tr').last();

    const shots = parseInt(shootRow.find('td[data-stat="shots"]').text()) || 0;
    const shotsOnTarget = parseInt(shootRow.find('td[data-stat="shots_on_target"]').text()) || 0;

    // Possession Stats
    const possessionStats = $('table#stats_possession_dom_lg').first();
    const possRow = possessionStats.find('tbody tr').last();

    const progressiveCarries = parseInt(possRow.find('td[data-stat="carries_progressive"]').text()) || 0;
    const progressivePasses = parseInt(possRow.find('td[data-stat="passes_progressive"]').text()) || 0;

    return {
      name,
      id: playerId,
      team,
      position,
      matches,
      starts,
      minutes,
      goals,
      assists,
      xG,
      xA,
      progressiveCarries,
      progressivePasses,
      shots,
      shotsOnTarget,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Searches for a player and returns their FBRef URL
   */
  public static async searchPlayer(name: string): Promise<string | null> {
    try {
      const searchUrl = `${this.BASE_URL}/en/search/search.fcgi?search=${encodeURIComponent(name)}`;
      const html = await this.fetchWithDelay(searchUrl);
      const $ = cheerio.load(html);

      // Find the first player result
      const playerLink = $('div.search-item-name')
        .filter((_, el) => $(el).text().toLowerCase().includes('page'))
        .first()
        .find('a');

      if (playerLink.length === 0) {
        return null;
      }

      return playerLink.attr('href') || null;
    } catch (error) {
      console.error('Error searching for player:', error);
      return null;
    }
  }

  /**
   * Gets player bio information from FBRef
   */
  public static async getPlayerBio(playerName: string): Promise<PlayerBio | null> {
    try {
      const playerUrl = await this.searchPlayer(playerName);
      if (!playerUrl) {
        return null;
      }

      const html = await this.fetchWithDelay(`${this.BASE_URL}${playerUrl}`);
      const $ = cheerio.load(html);

      const bio: PlayerBio = {
        player_name: playerName,
        full_name: $('h1[itemprop="name"]').text().trim(),
        position: $('strong:contains("Position:")').parent().text().replace('Position:', '').trim(),
        foot: $('strong:contains("Footed:")').parent().text().replace('Footed:', '').trim(),
        height: $('strong:contains("Height:")').parent().text().replace('Height:', '').trim(),
        weight: $('strong:contains("Weight:")').parent().text().replace('Weight:', '').trim(),
        birth_date: $('strong:contains("Born:")').parent().text().replace('Born:', '').split('in')[0].trim(),
        birth_place: $('strong:contains("Born:")').parent().text().split('in')[1]?.trim(),
        nationality: $('strong:contains("National Team:")').parent().text().replace('National Team:', '').trim(),
        current_club: $('strong:contains("Club:")').parent().text().replace('Club:', '').trim()
      };

      return bio;
    } catch (error) {
      console.error('Error fetching player bio:', error);
      return null;
    }
  }
}

const FBREF_BASE_URL = 'https://fbref.com';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// Free proxy service - you can replace this with a paid service for better reliability
const PROXY_URL = 'https://api.scraperapi.com';
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY || '';

async function delay(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

const fetchWithRetry = async (url: string, maxRetries = 3, initialDelay = 1000): Promise<string> => {
  const scraperApiKey = process.env.SCRAPER_API_KEY;
  if (!scraperApiKey) {
    throw new Error('SCRAPER_API_KEY is not configured');
  }

  let lastError = new Error('Maximum retries reached');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Make sure we're using the full URL
      const targetUrl = url.startsWith('http') ? url : `https://fbref.com${url}`;
      console.log(`Making request to ScraperAPI for URL: ${targetUrl}`);
      
      // Add parameters for JavaScript rendering and other options
      const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(targetUrl)}&render=true&keep_headers=true&premium=true`;
      console.log(`ScraperAPI URL: ${scraperUrl}`);
      
      const response = await axios.get(scraperUrl, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Accept-Encoding': 'gzip, compress, deflate, br',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 60000 // Increased timeout to 60 seconds
      });

      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      lastError = error as Error;
      console.error('Error in fetchWithRetry:', error);
      if (i < maxRetries - 1) {
        // Calculate delay with exponential backoff
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

export async function getPlayerBioFromFBRef(urlOrName: string, isDirectUrl: boolean = false): Promise<PlayerBio | null> {
  try {
    const url = isDirectUrl ? urlOrName : `https://fbref.com/en/search/search.fcgi?search=${encodeURIComponent(urlOrName)}`;
    console.log(`Fetching URL: ${url}`);
    
    const html = await fetchWithRetry(url);
    console.log('Received response from ScraperAPI');
    console.log('Response HTML preview:', html.substring(0, 500));
    
    const $ = cheerio.load(html);
    
    // If this is a search page, get the first player result
    if (!isDirectUrl) {
      console.log('Searching for player links...');
      const searchResults = $('.search-item-name');
      console.log(`Found ${searchResults.length} search results`);
      
      const firstPlayerLink = searchResults.first().find('a');
      if (firstPlayerLink.length === 0) {
        console.log('No player found in search results');
        return null;
      }
      
      const playerUrl = 'https://fbref.com' + firstPlayerLink.attr('href');
      console.log(`Found player URL: ${playerUrl}`);
      return getPlayerBioFromFBRef(playerUrl, true);
    }
    
    // Extract player information from profile page
    console.log('Attempting to extract player information...');
    
    // Try different selectors for the player info section
    const playerInfo = $('#meta, #info');
    console.log(`Found ${playerInfo.length} info divs`);
    
    if (playerInfo.length === 0) {
      console.log('Could not find player info section');
      console.log('Available sections:', $('div').map((_, el) => $(el).attr('id')).get().join(', '));
      return null;
    }

    // Try different selectors for the player name
    const nameElem = playerInfo.find('h1[itemprop="name"], h1.player_name, h1');
    console.log(`Found ${nameElem.length} name elements`);
    const name = nameElem.text().trim();
    console.log(`Found player name: ${name}`);

    if (!name) {
      console.log('Could not find player name');
      console.log('Available h1s:', $('h1').map((_, el) => $(el).text()).get().join(', '));
      return null;
    }

    const bio: PlayerBio = {
      player_name: name,
      full_name: name,
      position: '',
      foot: '',
      height: '',
      weight: '',
      birth_date: '',
      birth_place: '',
      current_club: ''
    };

    // Extract all paragraphs from player info
    const infoParagraphs = playerInfo.find('p, .info_box');
    console.log(`Found ${infoParagraphs.length} info paragraphs`);
    
    infoParagraphs.each((_, elem) => {
      const text = $(elem).text().trim();
      console.log(`Processing info line: ${text}`);
      
      if (text.includes('Position:')) {
        bio.position = text.split('Position:')[1].split('•')[0].trim();
      } else if (text.includes('Footed:')) {
        bio.foot = text.split('Footed:')[1].split('•')[0].trim();
      } else if (text.includes('Height:')) {
        bio.height = text.split('Height:')[1].split('•')[0].trim();
      } else if (text.includes('Weight:')) {
        bio.weight = text.split('Weight:')[1].split('•')[0].trim();
      } else if (text.includes('Born:')) {
        const birthInfo = text.split('Born:')[1].trim();
        const birthParts = birthInfo.split('in');
        bio.birth_date = birthParts[0].trim();
        bio.birth_place = birthParts[1]?.trim() || '';
      } else if (text.includes('Club:')) {
        bio.current_club = text.split('Club:')[1].split('•')[0].trim();
      }
    });

    console.log('Extracted bio:', bio);
    
    // Validate that we have at least some basic info
    if (!bio.player_name) {
      console.log('Failed to extract player name');
      return null;
    }

    return bio;
  } catch (error) {
    console.error('Error in getPlayerBioFromFBRef:', error);
    return null;
  }
}

// Example usage:
// const playerUrl = await FBRefAPI.searchPlayer('Kevin De Bruyne');
// if (playerUrl) {
//   const stats = await FBRefAPI.getPlayerStats(playerUrl);
//   console.log(stats);
// } 