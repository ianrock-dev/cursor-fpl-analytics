import { supabase } from '../src/utils/supabase';

async function createPlayerBiosTable() {
    console.log('Creating player_bios table...');
    
    const sql = `
        CREATE TABLE IF NOT EXISTS player_bios (
            id SERIAL PRIMARY KEY,
            player_name VARCHAR NOT NULL,
            full_name VARCHAR,
            birth_date VARCHAR,
            birth_place VARCHAR,
            nationality VARCHAR,
            height VARCHAR,
            weight VARCHAR,
            position VARCHAR,
            foot VARCHAR,
            current_club VARCHAR,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(player_name)
        );
    `;

    const { error } = await supabase.from('player_bios').select('count').single();
    
    if (error?.code === '42P01') { // Table doesn't exist
        const { error: createError } = await supabase.rpc('exec_sql', { sql });
        if (createError) {
            console.error('Error creating table:', createError);
            return;
        }
        console.log('Table created successfully');
    } else {
        console.log('Table already exists');
    }
}

async function main() {
    try {
        await createPlayerBiosTable();
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit(0);
    }
}

main(); 