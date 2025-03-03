import axios from 'axios';
import * as cheerio from 'cheerio';

async function fetchPremierLeaguePlayers(): Promise<{ name: string; position: string; fbrefId: string }[]> {
    const url = 'https://fbref.com/en/comps/9/Premier-League-Stats';
    try {
        const { data } = await axios.get<string>(url);
        const $ = cheerio.load(data);

        const players: { name: string; position: string; fbrefId: string }[] = [];
        $('#stats_standard tbody tr').each((index: number, element: cheerio.Element) => {
            const playerName = $(element).find('td[data-stat="player"] a').text();
            const playerPosition = $(element).find('td[data-stat="position"]').text();
            const playerId = $(element).find('td[data-stat="player"] a').attr('href')?.split('/')[3];

            if (playerName && playerId) {
                players.push({
                    name: playerName,
                    position: playerPosition,
                    fbrefId: playerId
                });
            }
        });

        console.log(`Fetched ${players.length} players from FBref`);
        return players;
    } catch (error) {
        console.error('Error fetching players from FBref:', error);
        return [];
    }
}

fetchPremierLeaguePlayers().then(players => console.log(players)); 