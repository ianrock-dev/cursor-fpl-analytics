'use client';

import { useTeam, useTeamMatches } from '@/hooks/useFootballData';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function TeamPage() {
  const { id } = useParams();
  const teamId = parseInt(id as string);
  
  const { data: team, error: teamError, isLoading: teamLoading } = useTeam(teamId);
  const { data: matches, error: matchesError, isLoading: matchesLoading } = useTeamMatches(teamId);

  if (teamLoading || matchesLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (teamError) {
    return <div className="text-red-500">Error loading team: {teamError}</div>;
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Team Header */}
        <div className="bg-slate-800 text-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-6">
            {team.crest && (
              <img 
                src={team.crest} 
                alt={`${team.name} crest`}
                className="w-24 h-24 object-contain"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <p className="text-slate-300">{team.venue}</p>
              {team.website && (
                <a 
                  href={team.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                >
                  Official Website
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coach Section */}
          <div className="lg:col-span-1">
            {team.coach && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Coach</h2>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800">{team.coach.name}</p>
                  <p className="text-gray-600">{team.coach.nationality}</p>
                </div>
              </div>
            )}

            {/* Team Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Team Info</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600">Founded</p>
                  <p className="font-semibold text-gray-800">{team.founded || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Stadium</p>
                  <p className="font-semibold text-gray-800">{team.venue}</p>
                </div>
                <div>
                  <p className="text-gray-600">Short Name</p>
                  <p className="font-semibold text-gray-800">{team.shortName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Code</p>
                  <p className="font-semibold text-gray-800">{team.tla}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Squad Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Squad</h2>
              
              {/* Squad Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.squad.map((player) => (
                  <Link
                    href={`/players/${player.id}`}
                    key={player.id}
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{player.name}</p>
                      <p className="text-gray-600">{player.position}</p>
                      {player.shirtNumber && (
                        <p className="text-sm text-gray-500">#{player.shirtNumber}</p>
                      )}
                      <p className="text-sm text-gray-500">{player.nationality}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Matches Section */}
        {matches && matches.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Matches</h2>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-4">
                {matches.slice(0, 5).map((match) => (
                  <Link
                    href={`/matches/${match.id}`}
                    key={match.id}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{match.homeTeam.name}</p>
                      </div>
                      <div className="flex-1 text-center">
                        {match.status === 'FINISHED' ? (
                          <div>
                            <div className="text-xl font-bold text-gray-800">
                              {match.score.fullTime.home} - {match.score.fullTime.away}
                            </div>
                            <div className="text-sm text-gray-500">Final Score</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-lg font-bold text-gray-800">VS</div>
                            <div className="text-sm text-gray-600">
                              {new Date(match.utcDate).toLocaleString()}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">{match.status}</div>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-semibold text-gray-800">{match.awayTeam.name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {matchesError && (
          <div className="text-red-500 mt-4">
            Error loading matches: {matchesError}
          </div>
        )}
      </div>
    </div>
  );
} 