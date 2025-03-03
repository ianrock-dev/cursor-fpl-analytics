# Improved StatsBomb Heatmap Solution

This document outlines the improved solution for creating and maintaining player heatmaps using StatsBomb data in the FPL Analytics application.

## Overview

The new solution addresses several issues with the previous implementation:

1. **Data Availability**: The previous implementation made real-time API calls to StatsBomb for each request, leading to frequent 404 errors and missing data.
2. **Performance**: Generating heatmaps on-demand was slow and resource-intensive.
3. **Caching**: The previous caching mechanism was basic and didn't handle data expiration.
4. **Player ID Mapping**: There was no robust system for mapping between FPL player IDs and StatsBomb player IDs.

## Solution Components

### 1. Multi-Level Caching System

The new solution implements a multi-level caching system:

- **Database Cache**: Heatmap data is stored in Supabase for fast retrieval.
- **File Cache**: Heatmap data is also cached in JSON files for backup and offline access.
- **Memory Cache**: Frequently accessed data is cached in memory for optimal performance.

### 2. Player ID Mapping

A dedicated system for mapping between FPL player IDs and StatsBomb player IDs:

- **Database Table**: A `player_id_mappings` table stores the relationships between IDs.
- **Name Matching Algorithm**: A sophisticated algorithm matches players by name similarity.
- **Manual Overrides**: Support for manual overrides when automatic matching fails.

### 3. Pre-Generation of Heatmaps

Instead of generating heatmaps on-demand, the solution includes scripts to pre-generate heatmaps:

- **Batch Processing**: A script processes all players in batches to avoid rate limiting.
- **Scheduled Updates**: Heatmaps are updated on a regular schedule (e.g., weekly).
- **Incremental Updates**: Only new matches are processed for existing players.

### 4. Robust Error Handling

The solution includes comprehensive error handling:

- **Graceful Fallbacks**: When real data is unavailable, the system falls back to placeholder data.
- **Detailed Logging**: All errors are logged with context for easier debugging.
- **Retry Mechanisms**: Failed requests are retried with exponential backoff.

## Implementation Details

### Database Schema

Two main tables are used:

1. **player_id_mappings**:
   - `fpl_id`: FPL player ID (primary key)
   - `statsbomb_id`: StatsBomb player ID
   - `name`: Player name
   - `created_at`: Timestamp of creation
   - `updated_at`: Timestamp of last update

2. **player_heatmaps**:
   - `fpl_player_id`: FPL player ID (foreign key)
   - `statsbomb_player_id`: StatsBomb player ID
   - `heatmap_data`: JSON array of heatmap points
   - `matches_included`: Array of match IDs included in the heatmap
   - `total_events`: Total number of events used to generate the heatmap
   - `last_updated`: Timestamp of last update

### Utility Files

1. **statsbomb-heatmap-cache.ts**: Manages caching of heatmap data.
2. **player-id-mapping.ts**: Handles mapping between FPL and StatsBomb player IDs.
3. **statsbomb-heatmap-generator.ts**: Generates heatmaps from StatsBomb event data.

### Scripts

1. **create-heatmap-tables.sql**: SQL script to create the necessary database tables.
2. **populate-player-mappings.js**: Script to populate the player ID mappings table.
3. **generate-heatmaps.ts**: Script to pre-generate heatmaps for all players.

## Setup Instructions

1. **Create Database Tables**:
   ```bash
   psql -U your_username -d your_database -f scripts/create-heatmap-tables.sql
   ```

2. **Populate Player ID Mappings**:
   ```bash
   node scripts/populate-player-mappings.js
   ```

3. **Generate Heatmaps**:
   ```bash
   npx ts-node scripts/generate-heatmaps.ts
   ```

4. **Schedule Regular Updates**:
   Add a cron job to run the heatmap generation script weekly:
   ```
   0 0 * * 0 cd /path/to/project && npx ts-node scripts/generate-heatmaps.ts >> logs/heatmap-generation.log 2>&1
   ```

## API Usage

The updated API endpoint at `/api/statsbomb/player-heatmap` now follows this process:

1. Try to get heatmap data from the database (fastest).
2. If not found, try to get data from the file cache.
3. If not found, generate new heatmap data and cache it.
4. If generation fails, fall back to placeholder data.

Example request:
```
GET /api/statsbomb/player-heatmap?playerId=427
```

Example response:
```json
{
  "playerId": 427,
  "heatmap": [
    { "x": 65.2, "y": 32.8, "value": 5 },
    { "x": 78.4, "y": 45.1, "value": 8 },
    ...
  ],
  "isRealData": true
}
```

## Maintenance

To maintain the system:

1. **Update Player Mappings**: Run the mapping script when new players are added to FPL.
2. **Regenerate Heatmaps**: Run the heatmap generation script after major tournaments or matches.
3. **Monitor Cache Size**: Check the size of the cache directory periodically.
4. **Validate Data Quality**: Periodically check the quality of generated heatmaps.

## Future Enhancements

1. **Advanced Filtering**: Allow filtering heatmap data by season, competition, or time period.
2. **Comparison Views**: Enable side-by-side comparison of player heatmaps.
3. **Position-Specific Analysis**: Provide position-specific insights based on heatmap data.
4. **Integration with Other Metrics**: Combine heatmap data with other performance metrics.
5. **Real-time Updates**: Implement WebSockets for real-time updates during matches. 