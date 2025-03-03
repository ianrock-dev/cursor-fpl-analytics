// Mock data for FPL API responses

export const mockManagerData = {
  id: 123456,
  player_first_name: "John",
  player_last_name: "Doe",
  name: "Team Awesome",
  summary_overall_rank: 350000,
  summary_overall_points: 1250,
  value: 1025, // Team value in tenths of millions (£102.5m)
  
  // Additional fields that might be useful
  started_event: 1,
  current_event: 12,
  last_deadline_bank: 15,
  last_deadline_value: 1025,
  kit: "shirt_1_2"
};

export const mockLeagueData = {
  league: {
    id: 12345,
    name: "Global League",
    created: "2023-07-01T10:00:00Z",
    closed: false
  },
  standings: {
    has_next: true,
    page: 1,
    results: [
      {
        id: 1,
        event_total: 65,
        player_name: "Jane Smith",
        rank: 1,
        last_rank: 2,
        rank_sort: 1,
        total: 1350,
        entry: 654321,
        entry_name: "Jane's Winners"
      },
      {
        id: 2,
        event_total: 58,
        player_name: "Alex Johnson",
        rank: 2,
        last_rank: 1,
        rank_sort: 2,
        total: 1340,
        entry: 654322,
        entry_name: "Alex's Attackers"
      },
      {
        id: 3,
        event_total: 50,
        player_name: "Sarah Williams",
        rank: 3,
        last_rank: 3,
        rank_sort: 3,
        total: 1320,
        entry: 654323,
        entry_name: "Sarah's Stars"
      }
    ]
  }
};

export const mockTeamData = [
  {
    id: 1,
    name: "Arsenal",
    short_name: "ARS",
    strength: 4,
    strength_overall_home: 1270,
    strength_overall_away: 1290,
    strength_attack_home: 1290,
    strength_attack_away: 1310,
    strength_defence_home: 1260,
    strength_defence_away: 1280
  },
  {
    id: 2,
    name: "Aston Villa",
    short_name: "AVL",
    strength: 3,
    strength_overall_home: 1170,
    strength_overall_away: 1150,
    strength_attack_home: 1180,
    strength_attack_away: 1150,
    strength_defence_home: 1160,
    strength_defence_away: 1140
  }
];

// Helper function to simulate an API response
export const getMockData = (endpoint: string) => {
  switch (endpoint) {
    case 'manager':
      return { ...mockManagerData };
    case 'league':
      return { ...mockLeagueData };
    case 'teams':
      return [...mockTeamData];
    default:
      return null;
  }
}; 