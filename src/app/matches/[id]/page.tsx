'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMatch } from '@/hooks/useFootballData';

export default function MatchDetailsPage() {
  const { id } = useParams();
  const matchId = parseInt(id as string);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats'>('overview');

  const { data: match, error, isLoading } = useMatch(matchId);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading match: {error}</div>;
  }

  if (!match) {
    return <div>Match not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Match Header */}
        <div className="p-6 bg-slate-800 text-white">
          <div className="text-center mb-4">
            <p className="text-sm text-slate-400">{match.competition.name}</p>
            <p className="text-sm text-slate-400">
              {new Date(match.utcDate).toLocaleDateString()} - Matchday {match.matchday}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <Link href={`/teams/${match.homeTeam.id}`} className="hover:text-slate-300">
                <img 
                  src={match.homeTeam.crest} 
                  alt={match.homeTeam.name}
                  className="w-16 h-16 mx-auto mb-2"
                />
                <h2 className="text-lg font-bold">{match.homeTeam.name}</h2>
              </Link>
            </div>
            
            <div className="flex-1 text-center">
              {match.status === 'FINISHED' ? (
                <div className="text-4xl font-bold space-x-4">
                  <span>{match.score.fullTime.home}</span>
                  <span>-</span>
                  <span>{match.score.fullTime.away}</span>
                </div>
              ) : (
                <div>
                  <div className="text-xl font-bold mb-2">VS</div>
                  <div className="text-sm">{new Date(match.utcDate).toLocaleTimeString()}</div>
                </div>
              )}
              <div className="text-sm mt-2 px-3 py-1 inline-block rounded bg-slate-700">
                {match.status}
              </div>
            </div>
            
            <div className="flex-1 text-center">
              <Link href={`/teams/${match.awayTeam.id}`} className="hover:text-slate-300">
                <img 
                  src={match.awayTeam.crest} 
                  alt={match.awayTeam.name}
                  className="w-16 h-16 mx-auto mb-2"
                />
                <h2 className="text-lg font-bold">{match.awayTeam.name}</h2>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'stats'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Match Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Score Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full Time</span>
                      <span className="font-medium">
                        {match.score.fullTime.home} - {match.score.fullTime.away}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Half Time</span>
                      <span className="font-medium">
                        {match.score.halfTime.home} - {match.score.halfTime.away}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Match Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stage</span>
                      <span className="font-medium">{match.stage}</span>
                    </div>
                    {match.group && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Group</span>
                        <span className="font-medium">{match.group}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4">Match Statistics</h3>
              <p className="text-gray-500 text-center">
                Match statistics will be available here once the API supports them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 