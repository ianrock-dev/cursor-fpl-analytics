import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function viewPlayerData() {
  // Get one player to see the data structure
  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .not('data->footballData', 'is', null)
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching player:', error);
    return;
  }

  console.log('Example player data structure:');
  console.log(JSON.stringify(player, null, 2));

  // Get count of players with football data
  const { count, error: countError } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .not('data->footballData', 'is', null);

  if (countError) {
    console.error('Error getting count:', countError);
    return;
  }

  console.log(`\nTotal players with football data: ${count}`);
}

viewPlayerData().catch(console.error); 