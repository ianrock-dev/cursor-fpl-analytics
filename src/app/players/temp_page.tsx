import { getPlayerFromCache } from '@/utils/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft, FaFutbol, FaHandsHelping, FaShieldAlt } from 'react-icons/fa';

interface PlayerData {
  id: number;
  web_name: string;
  team: number;
  element_type: number;
  total_points: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  minutes: number;
  form: string;
  now_cost: number;
  team_name?: string;
  team_code?: number;
  position?: string;
  football_data?: {
    name?: string;
    position?: string;
    dateOfBirth?: string;
    nationality?: string;
    shirtNumber?: number;
  };
}

interface PlayerPageProps {
  params: {
    id: string;
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const playerId = parseInt(params.id);
  
  if (isNaN(playerId)) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-500">Invalid player ID</h1>
      </div>
    );
  }

  const player = await getPlayerFromCache(playerId);
  
  if (!player) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-500">Player not found</h1>
      </div>
    );
  }

  console.log('Player data:', player);

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string | undefined): number => {
    if (!dateOfBirth) return 0;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="container mx-auto p-4">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/players" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <FaArrowLeft className="mr-2" />
          Back to Players
        </Link>
      </div>

      {/* Player header */}
      <div className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-4">
        <div className="relative w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
          {player.team_code && (
            <Image
              src={`https://resources.premierleague.com/premierleague/badges/t${player.team_code}.png`}
              alt={player.team_name || 'Team crest'}
              fill
              className="object-contain"
            />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{player.football_data?.name || player.web_name}</h1>
          <p className="text-xl text-gray-600">
            {player.team_name} • {player.position}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bio section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Player Bio</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Full Name:</span> {player.football_data?.name || player.web_name}
            </div>
            <div>
              <span className="font-medium">Position:</span> {player.position || player.football_data?.position || 'N/A'}
            </div>
            {player.football_data?.dateOfBirth && (
              <>
                <div>
                  <span className="font-medium">Date of Birth:</span> {new Date(player.football_data.dateOfBirth).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Age:</span> {calculateAge(player.football_data.dateOfBirth)}
                </div>
              </>
            )}
            <div>
              <span className="font-medium">Nationality:</span> {player.football_data?.nationality || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Team:</span> {player.team_name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Current Price:</span> £{(player.now_cost / 10).toFixed(1)}m
            </div>
          </div>
        </div>

        {/* FPL Stats */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">FPL Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Points</p>
              <p className="text-2xl font-bold">{player.total_points}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Form</p>
              <p className="text-2xl font-bold">{player.form}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Minutes</p>
              <p className="text-2xl font-bold">{player.minutes}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Price</p>
              <p className="text-2xl font-bold">£{(player.now_cost / 10).toFixed(1)}m</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="flex justify-center mb-1">
                <FaFutbol className="text-green-600" />
              </div>
              <p className="text-gray-600 text-sm">Goals</p>
              <p className="text-2xl font-bold">{player.goals_scored}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="flex justify-center mb-1">
                <FaHandsHelping className="text-blue-600" />
              </div>
              <p className="text-gray-600 text-sm">Assists</p>
              <p className="text-2xl font-bold">{player.assists}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="flex justify-center mb-1">
                <FaShieldAlt className="text-purple-600" />
              </div>
              <p className="text-gray-600 text-sm">Clean Sheets</p>
              <p className="text-2xl font-bold">{player.clean_sheets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug section - only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug: Raw Player Data</h3>
          <pre className="text-xs overflow-auto">{JSON.stringify(player, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

