/**
 * Seasons Data Transfer Objects
 * Framework-agnostic data structures for season operations
 */

export interface CreateSeasonDTO {
  name: string;
  description?: string;
  leagueId: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  isActive?: boolean;
  pointsSystem?: string;
  qualificationRules?: string;
  prizeStructure?: string;
}

export interface UpdateSeasonDTO {
  id: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  pointsSystem?: string;
  qualificationRules?: string;
  prizeStructure?: string;
}

export interface SeasonDTO {
  id: string;
  name: string;
  description?: string;
  leagueId: string;
  leagueName: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  pointsSystem?: string;
  qualificationRules?: string;
  prizeStructure?: string;
  seriesCount: number;
  tournamentCount: number;
  playerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonListDTO {
  seasons: SeasonDTO[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SeasonSearchDTO {
  leagueId?: string;
  isActive?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'startDate' | 'endDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface SeasonSummaryDTO {
  id: string;
  name: string;
  leagueName: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  seriesCount: number;
  tournamentCount: number;
  playerCount: number;
}

export interface SeasonDetailsDTO {
  id: string;
  name: string;
  description?: string;
  leagueId: string;
  leagueName: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  pointsSystem?: string;
  qualificationRules?: string;
  prizeStructure?: string;
  series: {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    tournamentCount: number;
    isActive: boolean;
  }[];
  tournaments: {
    id: string;
    name: string;
    date: string;
    seriesId?: string;
    seriesName?: string;
    playerCount: number;
    isCompleted: boolean;
  }[];
  standings: {
    playerId: string;
    playerName: string;
    rank: number;
    points: number;
    tournaments: number;
    bestFinish: number;
  }[];
  stats: {
    totalTournaments: number;
    completedTournaments: number;
    totalPlayers: number;
    totalPrizePool: number;
    averagePlayers: number;
    averagePrizePool: number;
  };
}

export interface SeasonStatsDTO {
  id: string;
  name: string;
  leagueName: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  totalTournaments: number;
  completedTournaments: number;
  totalPlayers: number;
  totalPrizePool: number;
  totalPoints: number;
  averagePlayers: number;
  averagePrizePool: number;
  topPerformers: {
    playerId: string;
    playerName: string;
    rank: number;
    points: number;
    tournaments: number;
    bestFinish: number;
  }[];
}
