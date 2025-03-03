'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getPlayerFromCache } from '@/utils/supabase';
import { FaArrowUp, FaArrowDown, FaFutbol, FaHandsHelping, FaInfoCircle, FaCalendarAlt, FaTrophy } from 'react-icons/fa';

interface PlayerHeatmapProps {
  playerId: number;
  type: 'season' | 'fixtures';
}

interface HeatmapData {
  x: number;
  y: number;
  value: number;
}

interface Match {
  id: number;
  date: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  playerTeam: string;
  goals: number;
  assists: number;
  playerScore: number;
  result: 'W' | 'D' | 'L';
}

// Sample match data - this would be fetched from an API in a real implementation
const sampleMatches: Match[] = [
  {
    id: 1,
    date: '2023-05-28',
    competition: 'Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Everton',
    homeScore: 5,
    awayScore: 1,
    playerTeam: 'Arsenal',
    goals: 2,
    assists: 1,
    playerScore: 15,
    result: 'W'
  },
  {
    id: 2,
    date: '2023-05-21',
    competition: 'Premier League',
    homeTeam: 'Newcastle',
    awayTeam: 'Arsenal',
    homeScore: 0,
    awayScore: 2,
    playerTeam: 'Arsenal',
    goals: 0,
    assists: 1,
    playerScore: 8,
    result: 'W'
  },
  {
    id: 3,
    date: '2023-05-14',
    competition: 'Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Brighton',
    homeScore: 0,
    awayScore: 3,
    playerTeam: 'Arsenal',
    goals: 0,
    assists: 0,
    playerScore: 2,
    result: 'L'
  },
  {
    id: 4,
    date: '2023-05-07',
    competition: 'FA Cup',
    homeTeam: 'Arsenal',
    awayTeam: 'Liverpool',
    homeScore: 2,
    awayScore: 0,
    playerTeam: 'Arsenal',
    goals: 1,
    assists: 0,
    playerScore: 9,
    result: 'W'
  },
  {
    id: 5,
    date: '2023-05-03',
    competition: 'FA Cup',
    homeTeam: 'Liverpool',
    awayTeam: 'Arsenal',
    homeScore: 1,
    awayScore: 2,
    playerTeam: 'Arsenal',
    goals: 0,
    assists: 2,
    playerScore: 10,
    result: 'W'
  },
  {
    id: 6,
    date: '2023-04-26',
    competition: 'Champions League',
    homeTeam: 'Arsenal',
    awayTeam: 'Bayern Munich',
    homeScore: 2,
    awayScore: 2,
    playerTeam: 'Arsenal',
    goals: 1,
    assists: 0,
    playerScore: 7,
    result: 'D'
  }
];

export default function PlayerHeatmap({ playerId, type }: PlayerHeatmapProps) {
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [statsBombAttribution, setStatsBombAttribution] = useState(false);
  const [isRealData, setIsRealData] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch heatmap data from our StatsBomb API
        const response = await fetch(`/api/statsbomb/player-heatmap?playerId=${playerId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch heatmap data');
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setHeatmapData(data.data);
          setIsRealData(data.isRealData || false);
          setStatsBombAttribution(true);
        } else {
          throw new Error(data.message || 'Failed to fetch heatmap data');
        }
        
        // For fixtures type, fetch recent matches (still using mock data for now)
        if (type === 'fixtures') {
          // In a full implementation, this would fetch actual match data from StatsBomb
          // For now, we'll use the existing mock data
          const mockMatches: Match[] = [
            {
              id: 1,
              date: '2023-08-12',
              competition: 'Premier League',
              homeTeam: 'Arsenal',
              awayTeam: 'Nottingham Forest',
              homeScore: 2,
              awayScore: 1,
              playerTeam: 'Arsenal',
              goals: 1,
              assists: 0,
              playerScore: 8.2,
              result: 'W'
            },
            {
              id: 2,
              date: '2023-08-21',
              competition: 'Premier League',
              homeTeam: 'Crystal Palace',
              awayTeam: 'Arsenal',
              homeScore: 0,
              awayScore: 1,
              playerTeam: 'Arsenal',
              goals: 0,
              assists: 1,
              playerScore: 7.8,
              result: 'W'
            },
            {
              id: 3,
              date: '2023-08-26',
              competition: 'Premier League',
              homeTeam: 'Arsenal',
              awayTeam: 'Fulham',
              homeScore: 2,
              awayScore: 2,
              playerTeam: 'Arsenal',
              goals: 0,
              assists: 0,
              playerScore: 6.5,
              result: 'D'
            },
            {
              id: 4,
              date: '2023-09-03',
              competition: 'Premier League',
              homeTeam: 'Arsenal',
              awayTeam: 'Manchester United',
              homeScore: 3,
              awayScore: 1,
              playerTeam: 'Arsenal',
              goals: 1,
              assists: 1,
              playerScore: 9.1,
              result: 'W'
            },
            {
              id: 5,
              date: '2023-09-17',
              competition: 'Premier League',
              homeTeam: 'Everton',
              awayTeam: 'Arsenal',
              homeScore: 0,
              awayScore: 1,
              playerTeam: 'Arsenal',
              goals: 0,
              assists: 0,
              playerScore: 7.2,
              result: 'W'
            }
          ];
          
          setMatches(mockMatches);
        }
      } catch (err) {
        console.error('Error fetching heatmap data:', err);
        setError('Failed to load heatmap data. Please try again later.');
        setHeatmapData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [playerId, type]);

  // Draw the heatmap on canvas when data changes
  useEffect(() => {
    if (!canvasRef.current || heatmapData.length === 0 || loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pitch
    drawPitch(ctx, canvas.width, canvas.height);
    
    // Draw heatmap
    drawHeatmap(ctx, heatmapData, canvas.width, canvas.height);
    
    // Draw direction arrow
    drawDirectionArrow(ctx, canvas.width, canvas.height);
  }, [heatmapData, loading]);

  // Function to draw the soccer pitch
  const drawPitch = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Set pitch dimensions
    const pitchWidth = width * 0.9;
    const pitchHeight = height * 0.9;
    const xOffset = (width - pitchWidth) / 2;
    const yOffset = (height - pitchHeight) / 2;
    
    // Draw pitch outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(xOffset, yOffset, pitchWidth, pitchHeight);
    
    // Draw halfway line
    ctx.beginPath();
    ctx.moveTo(xOffset + pitchWidth / 2, yOffset);
    ctx.lineTo(xOffset + pitchWidth / 2, yOffset + pitchHeight);
    ctx.stroke();
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(
      xOffset + pitchWidth / 2,
      yOffset + pitchHeight / 2,
      pitchHeight / 10,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    
    // Draw penalty areas
    const penAreaWidth = pitchWidth / 5;
    const penAreaHeight = pitchHeight / 2.5;
    const penAreaYOffset = (pitchHeight - penAreaHeight) / 2;
    
    // Left penalty area
    ctx.strokeRect(
      xOffset,
      yOffset + penAreaYOffset,
      penAreaWidth,
      penAreaHeight
    );
    
    // Right penalty area
    ctx.strokeRect(
      xOffset + pitchWidth - penAreaWidth,
      yOffset + penAreaYOffset,
      penAreaWidth,
      penAreaHeight
    );
    
    // Draw goal areas
    const goalAreaWidth = pitchWidth / 10;
    const goalAreaHeight = pitchHeight / 5;
    const goalAreaYOffset = (pitchHeight - goalAreaHeight) / 2;
    
    // Left goal area
    ctx.strokeRect(
      xOffset,
      yOffset + goalAreaYOffset,
      goalAreaWidth,
      goalAreaHeight
    );
    
    // Right goal area
    ctx.strokeRect(
      xOffset + pitchWidth - goalAreaWidth,
      yOffset + goalAreaYOffset,
      goalAreaWidth,
      goalAreaHeight
    );
    
    // Draw penalty spots
    const penSpotDistance = pitchWidth / 8;
    
    // Left penalty spot
    ctx.beginPath();
    ctx.arc(
      xOffset + penSpotDistance,
      yOffset + pitchHeight / 2,
      2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Right penalty spot
    ctx.beginPath();
    ctx.arc(
      xOffset + pitchWidth - penSpotDistance,
      yOffset + pitchHeight / 2,
      2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  };

  // Function to draw direction arrow (left to right)
  const drawDirectionArrow = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const arrowLength = width * 0.15;
    const arrowHeight = height * 0.05;
    const xStart = width * 0.1;
    const yPos = height * 0.05;
    
    ctx.beginPath();
    ctx.moveTo(xStart, yPos);
    ctx.lineTo(xStart + arrowLength, yPos);
    ctx.lineTo(xStart + arrowLength - arrowHeight/2, yPos - arrowHeight/2);
    ctx.moveTo(xStart + arrowLength, yPos);
    ctx.lineTo(xStart + arrowLength - arrowHeight/2, yPos + arrowHeight/2);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add "Attack" text
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Attack', xStart + arrowLength / 2, yPos - 5);
  };

  // Function to draw heatmap
  const drawHeatmap = (ctx: CanvasRenderingContext2D, data: HeatmapData[], width: number, height: number) => {
    // Create a temporary canvas for the heatmap
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;
    
    // Draw heatmap points
    for (const point of data) {
      // Convert StatsBomb coordinates (0-120 x, 0-80 y) to canvas coordinates
      // StatsBomb coordinates: x is from left to right, y is from bottom to top
      // Canvas coordinates: x is from left to right, y is from top to bottom
      
      // Calculate the position on the canvas
      // Note: We're flipping the y-coordinate because StatsBomb's y=0 is at the bottom
      // while canvas y=0 is at the top
      const pitchWidth = width * 0.9;
      const pitchHeight = height * 0.9;
      const xOffset = (width - pitchWidth) / 2;
      const yOffset = (height - pitchHeight) / 2;
      
      const canvasX = xOffset + (point.x / 120) * pitchWidth;
      const canvasY = yOffset + pitchHeight - (point.y / 80) * pitchHeight; // Flip Y
      
      // Draw gradient circle for each point
      const radius = Math.max(width, height) * 0.03 * point.value;
      const gradient = tempCtx.createRadialGradient(
        canvasX, canvasY, 0,
        canvasX, canvasY, radius
      );
      
      gradient.addColorStop(0, `rgba(255, 0, 0, ${point.value})`);
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      tempCtx.beginPath();
      tempCtx.fillStyle = gradient;
      tempCtx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
      tempCtx.fill();
    }
    
    // Apply the heatmap to the main canvas with some transparency
    ctx.globalAlpha = 0.7;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.globalAlpha = 1.0;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-2 animate-pulse h-20 max-w-xs mx-auto">
        <div className="h-full flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-2 h-20 max-w-xs mx-auto">
        <div className="h-full flex items-center justify-center text-red-500 text-xs">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Render the heatmap visualization
  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden mx-auto ${type === 'season' ? 'max-w-sm' : 'max-w-xs'}`}>
      {/* Header */}
      <div className="p-2 bg-gray-800 border-b border-gray-700">
        <h3 className="text-sm font-medium text-white">
          {type === 'season' ? 'Season Heatmap' : 'Recent Fixtures'}
        </h3>
        {/* Show placeholder notice only if using placeholder data */}
        {!isRealData && (
          <div className="mt-1 text-xs text-gray-400 flex items-center">
            <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
            </svg>
            <span className="text-xs">Using placeholder data.</span>
          </div>
        )}
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64 bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div className="flex justify-center items-center h-64 bg-gray-900 text-red-500 p-4 text-center">
          {error}
        </div>
      )}
      
      {/* Canvas for heatmap */}
      {!loading && !error && (
        <div className="relative">
          <canvas 
            ref={canvasRef}
            width={type === 'season' ? 300 : 240}
            height={type === 'season' ? 200 : 160}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Activity level legend */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="text-xs text-gray-300">Activity:</div>       
        <div className="flex items-center">
          <div className="flex items-center mr-1">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-0.5"></div>
            <span className="text-[10px] text-gray-400">Low</span>
          </div>
          <div className="flex items-center mr-1">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-0.5"></div>
            <span className="text-[10px] text-gray-400">Med</span>
          </div>
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 mr-0.5"></div>   
            <span className="text-[10px] text-gray-400">High</span>
          </div>
        </div>
      </div>

      {/* StatsBomb attribution */}
      {statsBombAttribution && (
        <div className="text-xs text-gray-400 text-right mt-1">
          Data provided by StatsBomb
        </div>
      )}

      {/* Recent matches section */}
      {type === 'fixtures' && matches.length > 0 && (
        <div className="mt-4">
          <h4 className="text-base font-semibold text-white mb-2">Past Matches</h4>
          <div className="space-y-3">
            {/* Group matches by competition */}
            {Object.entries(
              matches.reduce((acc, match) => {
                if (!acc[match.competition]) {
                  acc[match.competition] = [];
                }
                acc[match.competition].push(match);
                return acc;
              }, {} as Record<string, Match[]>)
            ).map(([competition, competitionMatches]) => (
              <div key={competition} className="mb-3">
                <h5 className="text-xs font-medium text-gray-300 mb-1">{competition}</h5>
                <div className="grid grid-cols-1 gap-1">
                  {competitionMatches.map((match) => (
                    <div 
                      key={match.id} 
                      className="bg-gray-700 rounded p-2 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">{new Date(match.date).toLocaleDateString()}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getResultColor(match.result)}`}>
                            {match.result}
                          </span>
                        </div>
                        <div className="text-sm text-white">
                          {match.homeTeam} {match.homeScore} - {match.awayScore} {match.awayTeam}
                        </div>
                      </div>
                      <div className="ml-3 flex flex-col items-center">
                        <div className="text-base font-bold text-white">{match.playerScore.toFixed(1)}</div>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          {match.goals > 0 && (
                            <div className="flex items-center mr-2">
                              <FaFutbol className="mr-1" />
                              <span>{match.goals}</span>
                            </div>
                          )}
                          {match.assists > 0 && (
                            <div className="flex items-center">
                              <FaHandsHelping className="mr-1" />
                              <span>{match.assists}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getResultColor(result: 'W' | 'D' | 'L') {
  switch (result) {
    case 'W':
      return 'bg-green-800 text-green-200';
    case 'D':
      return 'bg-yellow-800 text-yellow-200';
    case 'L':
      return 'bg-red-800 text-red-200';
    default:
      return 'bg-gray-800 text-gray-200';
  }
}

function getPositionColor(elementType: number) {
  switch (elementType) {
    case 1: // GK
      return 'bg-yellow-600';
    case 2: // DEF
      return 'bg-blue-600';
    case 3: // MID
      return 'bg-green-600';
    case 4: // FWD
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
}

function getPositionStyle(elementType: number): React.CSSProperties {
  switch (elementType) {
    case 1: // GK
      return { left: '5%', top: '50%' };
    case 2: // DEF
      return { left: '25%', top: '50%' };
    case 3: // MID
      return { left: '50%', top: '50%' };
    case 4: // FWD
      return { left: '75%', top: '50%' };
    default:
      return { left: '50%', top: '50%' };
  }
} 