// Load environment variables first
import './load-env';
import { supabase } from '../src/utils/supabase';
import { getPlayerBioFromFBRef } from '../src/utils/fbref';
import * as fs from 'fs';

// Test players with their known FBRef URLs
const TEST_PLAYERS = [
    { name: 'Saliba', url: 'https://fbref.com/en/players/972aeb2a/William-Saliba' },
    { name: 'Saka', url: 'https://fbref.com/en/players/bc7dc64d/Bukayo-Saka' },
    { name: 'Martinelli', url: 'https://fbref.com/en/players/48a5a5d6/Gabriel-Martinelli' },
    { name: 'Ødegaard', url: 'https://fbref.com/en/players/79300479/Martin-Odegaard' },
    { name: 'Rice', url: 'https://fbref.com/en/players/1c7012b8/Declan-Rice' }
];

// File to track progress
const PROGRESS_FILE = 'player_bio_progress.json';

interface Progress {
    lastProcessedIndex: number;
    processedPlayers: string[];
}

async function delay(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

async function loadProgress(): Promise<Progress> {
    try {
        if (fs.existsSync(PROGRESS_FILE)) {
            const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
    return { lastProcessedIndex: -1, processedPlayers: [] };
}

async function saveProgress(progress: Progress) {
    try {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

async function populatePlayerBios() {
    console.log('Starting to process test players...');

    // Load progress
    const progress = await loadProgress();
    console.log('Loaded progress:', progress);

    for (let i = progress.lastProcessedIndex + 1; i < TEST_PLAYERS.length; i++) {
        const player = TEST_PLAYERS[i];
        
        // Skip if already processed
        if (progress.processedPlayers.includes(player.name)) {
            console.log(`Skipping ${player.name} - already processed`);
            continue;
        }

        try {
            console.log(`Processing ${player.name}...`);
            
            // Check if bio already exists
            const { data: existingBio } = await supabase
                .from('player_bios')
                .select('*')
                .eq('player_name', player.name)
                .single();

            if (existingBio) {
                console.log(`Bio already exists for ${player.name}, skipping...`);
                progress.processedPlayers.push(player.name);
                progress.lastProcessedIndex = i;
                await saveProgress(progress);
                continue;
            }

            // Add a longer delay between requests (50 seconds)
            console.log(`Waiting 50 seconds before processing ${player.name}...`);
            await delay(50000);

            // Fetch bio from FBRef using direct URL
            const bio = await getPlayerBioFromFBRef(player.url, true);
            if (!bio) {
                console.log(`No bio found for ${player.name}`);
                continue;
            }

            // Store in database
            const { error } = await supabase
                .from('player_bios')
                .upsert({
                    ...bio,
                    player_name: player.name,
                    last_updated: new Date().toISOString()
                });

            if (error) {
                console.error(`Error storing bio for ${player.name}:`, error);
            } else {
                console.log(`Successfully stored bio for ${player.name}`);
                progress.processedPlayers.push(player.name);
            }

            // Update progress
            progress.lastProcessedIndex = i;
            await saveProgress(progress);

        } catch (error) {
            console.error(`Error processing ${player.name}:`, error);
            // Don't update progress on error so we can retry
        }
    }
}

populatePlayerBios()
    .then(() => {
        console.log('Finished populating test player bios');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    }); 