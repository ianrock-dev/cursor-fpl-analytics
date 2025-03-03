# StatsBomb Integration for FPL Analytics

This document outlines the integration of StatsBomb open data into the FPL Analytics application to enhance player analysis and visualization.

## Overview

[StatsBomb](https://statsbomb.com/) provides free football data for research and analytics purposes through their [open-data repository](https://github.com/statsbomb/open-data). We've integrated this data to enhance our player heatmaps and performance statistics.

## Features

- **Player Heatmaps**: Visualize where players operate on the pitch using actual match event data
- **Match Performance Data**: Access detailed statistics for player performances in specific matches
- **Historical Analysis**: View player trends over time based on actual match data

## Implementation

The integration consists of the following components:

1. **Data Service (`src/utils/statsbomb.ts`)**: Handles fetching and caching data from the StatsBomb GitHub repository
2. **API Routes**:
   - `/api/statsbomb/competitions`: Fetches available competitions
   - `/api/statsbomb/matches`: Fetches matches for a specific competition and season
   - `/api/statsbomb/player-heatmap`: Generates heatmap data for a player

3. **UI Components**:
   - Enhanced `PlayerHeatmap` component to visualize player positions and movement

## Data Attribution

As per StatsBomb's terms of use, all data displayed from their repository includes proper attribution. The application displays "Data provided by StatsBomb" when their data is used.

## Player ID Mapping

One challenge with this integration is mapping FPL player IDs to StatsBomb player IDs. The current implementation includes placeholder functions for this mapping:

- `mapFplToStatsBombPlayerId`: Maps an FPL player ID to a StatsBomb player ID
- `mapStatsBombToFplPlayerId`: Maps a StatsBomb player ID to an FPL player ID

These functions currently return placeholder data, but in a full implementation, they would use a mapping table to convert between the two ID systems.

## Future Enhancements

1. **Complete Player ID Mapping**: Create a comprehensive mapping between FPL and StatsBomb player IDs
2. **Advanced Statistics**: Integrate additional metrics like expected goals (xG), pass completion, and defensive actions
3. **Match-by-Match Analysis**: Allow users to view player performance data for specific matches
4. **Comparative Analysis**: Enable comparison of players based on StatsBomb metrics

## Terms of Use

When using StatsBomb data, we comply with their [terms of use](https://github.com/statsbomb/open-data/blob/master/LICENSE.pdf):

1. We cite StatsBomb as the data source
2. We include their attribution in the UI
3. We use the data for research and genuine interest in football analytics

## Resources

- [StatsBomb Open Data Repository](https://github.com/statsbomb/open-data)
- [StatsBomb Resource Centre](https://statsbomb.com/resource-centre/) 