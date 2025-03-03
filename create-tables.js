// Script to create Supabase tables
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key configured:', !!supabaseAnonKey && supabaseAnonKey.length > 0);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTables() {
  console.log('Creating Supabase tables...');
  
  try {
    // Create player_summaries table using Supabase's REST API
    console.log('\nCreating player_summaries table...');
    
    // First, check if the table exists
    const { error: checkError } = await supabase
      .from('player_summaries')
      .select('count(*)')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Table does not exist, creating it...');
      
      // Execute raw SQL to create the table
      const { error: createError } = await supabase.rpc('create_player_summaries_table');
      
      if (createError) {
        console.error('Error creating table via RPC:', createError);
        console.log('Attempting alternative method...');
        
        // Try creating a function to create the table
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION create_player_summaries_table()
          RETURNS void AS $$
          BEGIN
            CREATE TABLE IF NOT EXISTS public.player_summaries (
              player_id INTEGER PRIMARY KEY,
              summary_data JSONB NOT NULL,
              last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            ALTER TABLE public.player_summaries ENABLE ROW LEVEL SECURITY;
            
            DROP POLICY IF EXISTS "Allow all operations for all users" ON public.player_summaries;
            CREATE POLICY "Allow all operations for all users" ON public.player_summaries
              FOR ALL
              USING (true)
              WITH CHECK (true);
            
            GRANT ALL ON public.player_summaries TO anon;
          END;
          $$ LANGUAGE plpgsql;
        `;
        
        console.log('Please run the following SQL in the Supabase SQL Editor:');
        console.log(createFunctionSQL);
        console.log('\nThen run:');
        console.log('SELECT create_player_summaries_table();');
        
        console.log('\nAlternatively, run this SQL directly:');
        console.log(`
          CREATE TABLE IF NOT EXISTS public.player_summaries (
            player_id INTEGER PRIMARY KEY,
            summary_data JSONB NOT NULL,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE public.player_summaries ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Allow all operations for all users" ON public.player_summaries;
          CREATE POLICY "Allow all operations for all users" ON public.player_summaries
            FOR ALL
            USING (true)
            WITH CHECK (true);
          
          GRANT ALL ON public.player_summaries TO anon;
        `);
      } else {
        console.log('✅ Successfully created player_summaries table');
      }
    } else if (checkError) {
      console.error('Error checking if table exists:', checkError);
    } else {
      console.log('✅ player_summaries table already exists');
    }
    
  } catch (err) {
    console.error('Unexpected error during table creation:', err);
  }
}

createTables(); 