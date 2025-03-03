import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sleep function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Rate limiter class - 10 requests per minute
class RateLimiter {
  private requestTimes: number[] = [];
  private readonly limit = 10;
  private readonly timeWindow = 60 * 1000; // 1 minute in milliseconds

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Remove requests older than the time window
    this.requestTimes = this.requestTimes.filter(time => now - time < this.timeWindow);
    
    if (this.requestTimes.length >= this.limit) {
      // Calculate how long to wait
      const oldestRequest = this.requestTimes[0];
      const waitTime = oldestRequest + this.timeWindow - now;
      console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime/1000)} seconds...`);
      await sleep(waitTime);
      return this.waitForSlot(); // Recheck after waiting
    }

    this.requestTimes.push(now);
  }
}

const rateLimiter = new RateLimiter();

// Fetch team data with rate limiting and retries
async function getTeam(teamId: number, retryCount = 0): Promise<any> {
  try {
    await rateLimiter.waitForSlot();
    const response = await axios.get(`${BASE_URL}/teams/${teamId}`, {
      headers: {
        'X-Auth-Token': FOOTBALL_DATA_API_KEY
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 429 && retryCount < 5) {
      const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
      console.log(`Rate limited. Waiting ${waitTime/1000} seconds before retry...`);
      await sleep(waitTime);
      return getTeam(teamId, retryCount + 1);
    }
    throw error;
  }
}

// Premier League team IDs for 2023/24 season (Free Tier Access)
const PREMIER_LEAGUE_TEAMS = [
  57,   // Arsenal
  58,   // Aston Villa
  61,   // Chelsea
  62,   // Everton
  64,   // Liverpool
  65,   // Manchester City
  66,   // Manchester United
  67,   // Newcastle
  73,   // Tottenham
  76,   // Wolves
];

async function populatePlayers() {
  console.log('Starting player population...');
  let updatedCount = 0;

  for (const teamId of PREMIER_LEAGUE_TEAMS) {
    try {
      console.log(`\nFetching players for team ID: ${teamId}`);
      const teamData = await getTeam(teamId);
      
      if (teamData.squad) {
        for (const player of teamData.squad) {
          try {
            const { data: existingPlayer } = await supabase
              .from('players')
              .select('*')
              .eq('id', player.id)
              .single();

            const playerData = {
              id: player.id,
              data: {
                ...existingPlayer?.data,
                footballData: {
                  name: player.name,
                  position: player.position,
                  dateOfBirth: player.dateOfBirth,
                  nationality: player.nationality,
                  team: {
                    id: teamData.id,
                    name: teamData.name,
                    shortName: teamData.shortName,
                    tla: teamData.tla,
                    crest: teamData.crest
                  }
                }
              },
              last_updated: new Date().toISOString()
            };

            const { error } = await supabase
              .from('players')
              .upsert(playerData);

            if (error) {
              console.error(`Error updating player ${player.name}:`, error);
            } else {
              updatedCount++;
              console.log(`Updated player: ${player.name}`);
            }
          } catch (error) {
            console.error(`Error processing player:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching team ${teamId}:`, error);
    }
  }

  console.log(`\nPopulation complete! Updated ${updatedCount} players.`);
}

// Run the population script
populatePlayers().catch(console.error); 