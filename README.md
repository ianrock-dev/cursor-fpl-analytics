# FPL Analytics

A Fantasy Premier League analytics application built with Next.js, React, TypeScript, and Supabase for database functionality. This application allows you to view your FPL team performance, search for other managers in the Fantasy Premier League, and analyze player statistics.

## Features

- **Dark theme** with FPL green accents
- **Overview tab** to connect to your FPL account and view your team stats
- **Manager Search tab** to find managers by ID or team name
- **Players tab** with detailed player statistics and performance data
- **Database caching** using Supabase for improved performance
- Connects to the official Fantasy Premier League API

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase account (free tier available) for database functionality

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fpl-analytics.git
cd fpl-analytics
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Set up Supabase:
   - Create a new project at [Supabase](https://app.supabase.com)
   - Create the following tables in your Supabase database:
     - `players` (columns: id, data, last_updated)
     - `player_summaries` (columns: player_id, summary_data, last_updated)
     - `all_players` (columns: id, players_data, last_updated)
   - Get your project URL and anon key from the API settings
   - Rename `.env.local.template` to `.env.local` and add your Supabase credentials

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Connecting to Your FPL Account

1. Go to the "Overview" tab
2. Enter your FPL team ID in the input field
   - You can find your team ID in the URL when you visit your FPL team page (e.g., `https://fantasy.premierleague.com/entry/1234567/event/1`)
3. Click "Connect FPL Account"

### Searching for Managers

1. Go to the "Manager Search" tab
2. Choose to search by Manager ID or Team Name
3. Enter the search term
4. Click "Search"

### Viewing Player Statistics

1. Go to the "Players" tab to see the full list of FPL players
2. Use the filters to narrow down your search by team, position, price range, etc.
3. Click on a player to view their detailed statistics, fixtures, and match history

## Performance Improvements

This application uses Supabase as a database to cache API responses and improve performance:

- **API Caching**: Responses from the FPL API are cached to reduce API calls and improve load times
- **Automatic Data Refresh**: Cached data is automatically refreshed based on age (6-12 hours)
- **Error Resilience**: Fallback to cached data when the API is unavailable

## FPL API Endpoints

This application uses the following Fantasy Premier League API endpoints:

- Bootstrap data: `https://fantasy.premierleague.com/api/bootstrap-static/`
- Player summary: `https://fantasy.premierleague.com/api/element-summary/{player_id}/`
- Manager details: `https://fantasy.premierleague.com/api/entry/{manager_id}/`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Fantasy Premier League for providing the API
- The FPL community for inspiration and data insights 