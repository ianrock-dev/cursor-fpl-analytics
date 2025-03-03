'use client';

import { useMatches } from '@/hooks/useFootballData';
import Link from 'next/link';
import { useState } from 'react';

const PREMIER_LEAGUE_ID = 2021;

export default function MatchesPage() {
  const [selectedCompetition, setSelectedCompetition] = useState(PREMIER_LEAGUE_ID);
  const { data: matches, error, isLoading } = useMatches(selectedCompetition);

  if (isLoading) {
    return <div className="text-center py-8">Loading matches...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Premier League Matches</h1>
      
      <div className="grid gap-4">
        {matches?.map((match) => (
          <Link 
            href={`/matches/${match.id}`}
            key={match.id}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  {match.homeTeam.crest && (
                    <img 
                      src={match.homeTeam.crest} 
                      alt={match.homeTeam.name}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{match.homeTeam.name}</p>
                    <p className="text-sm text-gray-600">{match.homeTeam.shortName}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center">
                {match.status === 'FINISHED' ? (
                  <div>
                    <div className="text-xl font-bold space-x-4">
                      <span>{match.score.fullTime.home}</span>
                      <span>-</span>
                      <span>{match.score.fullTime.away}</span>
                    </div>
                    <div className="text-sm text-gray-500">Final Score</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-lg font-bold mb-1">VS</div>
                    <div className="text-sm text-gray-600">
                      {new Date(match.utcDate).toLocaleString()}
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">{match.status}</div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-end space-x-3">
                  <div className="text-right">
                    <p className="font-semibold">{match.awayTeam.name}</p>
                    <p className="text-sm text-gray-600">{match.awayTeam.shortName}</p>
                  </div>
                  {match.awayTeam.crest && (
                    <img 
                      src={match.awayTeam.crest} 
                      alt={match.awayTeam.name}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div>
                Matchday {match.matchday}
              </div>
              <div>
                {match.competition.name}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 