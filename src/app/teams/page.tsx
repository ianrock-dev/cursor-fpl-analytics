'use client';

import { useState } from 'react';
import { useTeamSearch } from '@/hooks/useFootballData';
import Link from 'next/link';

const PREMIER_LEAGUE_TEAMS = [
  { id: 57, name: 'Arsenal' },
  { id: 58, name: 'Aston Villa' },
  { id: 61, name: 'Chelsea' },
  { id: 62, name: 'Everton' },
  { id: 64, name: 'Liverpool' },
  { id: 65, name: 'Manchester City' },
  { id: 66, name: 'Manchester United' },
  { id: 67, name: 'Newcastle United' },
  { id: 73, name: 'Tottenham Hotspur' },
  { id: 76, name: 'Wolverhampton Wanderers' },
  { id: 351, name: 'Nottingham Forest' },
  { id: 354, name: 'Crystal Palace' },
  { id: 356, name: 'Sheffield United' },
  { id: 397, name: 'Brighton & Hove Albion' },
  { id: 402, name: 'Brentford' },
  { id: 563, name: 'West Ham United' },
  { id: 1044, name: 'Bournemouth' },
  { id: 1072, name: 'Fulham' },
  { id: 1076, name: 'Burnley' },
  { id: 1799, name: 'Luton Town' },
];

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: searchResults, error, isLoading } = useTeamSearch(searchTerm, searchTerm.length >= 3);

  // Filter teams to show only Premier League teams
  const filteredTeams = searchResults?.filter(team => 
    PREMIER_LEAGUE_TEAMS.some(plTeam => plTeam.id === team.id)
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Premier League Teams</h1>
      
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search for a Premier League team..."
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p className="text-sm text-gray-500 mt-2">
          Enter at least 3 characters to search
        </p>
      </div>

      {isLoading && searchTerm.length >= 3 && (
        <div className="text-gray-600">Searching...</div>
      )}

      {error && (
        <div className="text-red-500">Error: {error}</div>
      )}

      {!searchTerm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREMIER_LEAGUE_TEAMS.map((team) => (
            <Link 
              href={`/teams/${team.id}`} 
              key={team.id}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <h2 className="text-xl font-semibold">{team.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}

      {searchTerm.length >= 3 && filteredTeams && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Link 
              href={`/teams/${team.id}`} 
              key={team.id}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4">
                {team.crest && (
                  <img 
                    src={team.crest} 
                    alt={`${team.name} crest`}
                    className="w-12 h-12 object-contain"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{team.name}</h2>
                  <p className="text-gray-600">{team.venue}</p>
                  <p className="text-sm text-gray-500">{team.tla}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {searchTerm.length >= 3 && filteredTeams?.length === 0 && (
        <div className="text-gray-600">
          No Premier League teams found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
} 