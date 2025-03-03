// Script to verify Supabase tables
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Supabase URL configured:', !!supabaseUrl);
console.log('Supabase Key configured:', !!supabaseAnonKey && supabaseAnonKey.length > 0);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyTables() {
  console.log('Verifying Supabase tables...');
  
  try {
    // Check players table
    console.log('\nChecking players table:');
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .limit(1);
    
    if (playersError) {
      console.error('Error accessing players table:', playersError);
    } else {
      console.log('✅ Players table exists and is accessible');
      console.log('Sample data:', playersData);
    }
    
    // Check player_summaries table
    console.log('\nChecking player_summaries table:');
    try {
      const { data: summariesData, error: summariesError } = await supabase
        .from('player_summaries')
        .select('*')
        .limit(1);
      
      if (summariesError) {
        console.error('Error accessing player_summaries table:', JSON.stringify(summariesError, null, 2));
      } else {
        console.log('✅ Player_summaries table exists and is accessible');
        console.log('Sample data:', summariesData);
      }
    } catch (err) {
      console.error('Exception when checking player_summaries table:', err);
    }
    
    // Check all_players table
    console.log('\nChecking all_players table:');
    const { data: allPlayersData, error: allPlayersError } = await supabase
      .from('all_players')
      .select('*')
      .limit(1);
    
    if (allPlayersError) {
      console.error('Error accessing all_players table:', allPlayersError);
    } else {
      console.log('✅ All_players table exists and is accessible');
      console.log('Sample data:', allPlayersData);
    }
    
    // Try to insert test data
    console.log('\nTesting insert capability:');
    const testId = Math.floor(Math.random() * 1000000);
    const { error: insertError } = await supabase
      .from('players')
      .upsert({
        id: testId,
        data: { test: 'data' },
        last_updated: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error inserting test data:', insertError);
    } else {
      console.log('✅ Successfully inserted test data');
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', testId);
      
      if (deleteError) {
        console.error('Error deleting test data:', deleteError);
      } else {
        console.log('✅ Successfully cleaned up test data');
      }
    }
    
    // Test player_summaries insert capability
    console.log('\nTesting player_summaries insert capability:');
    try {
      const testPlayerId = Math.floor(Math.random() * 1000000);
      const { error: summaryInsertError } = await supabase
        .from('player_summaries')
        .upsert({
          player_id: testPlayerId,
          summary_data: { test: 'summary data' },
          last_updated: new Date().toISOString()
        });
      
      if (summaryInsertError) {
        console.error('Error inserting test summary data:', JSON.stringify(summaryInsertError, null, 2));
      } else {
        console.log('✅ Successfully inserted test summary data');
        
        // Clean up test data
        const { error: summaryDeleteError } = await supabase
          .from('player_summaries')
          .delete()
          .eq('player_id', testPlayerId);
        
        if (summaryDeleteError) {
          console.error('Error deleting test summary data:', summaryDeleteError);
        } else {
          console.log('✅ Successfully cleaned up test summary data');
        }
      }
    } catch (err) {
      console.error('Exception when testing player_summaries insert:', err);
    }
    
  } catch (err) {
    console.error('Unexpected error during verification:', err);
  }
}

verifyTables(); 