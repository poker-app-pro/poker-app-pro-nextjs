/**
 * Series Data Transfer Objects
 * Framework-agnostic data structures for series operations
 */

export interface CreateSeriesDTO {
  name: string;
  description?: string;
  seasonId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  maxPlayers?: number;
  buyInAmount?: number;
  isActive?: boolean;
  settings?: {
    allowLateRegistration?: boolean;
    lateRegistrationMinutes?: number;
    rebuyAllowed?: boolean;
    rebuyCount?: number;
    addonAllowed?: boolean;
  };
}

export interface UpdateSeriesDTO {
  id: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  maxPlayers?: number;
  buyInAmount?: number;
  isActive?: boolean;
  settings?: {
    allowLateRegistration?: boolean;
    lateRegistrationMinutes?: number;
    rebuyAllowed?: boolean;
    rebuyCount?: number;
    addonAllowed?: boolean;
  };
}

export interface SeriesDTO {
  id: string;
  name: string;
  description?: string;
  seasonId: string;
  seasonName: string;
  leagueId: string;
  leagueName: string;
  startDate: string;
  endDate: string;
  maxPlayers?: number;
  buyInAmount?: number;
  isActive: boolean;
  settings: {
    allowLateRegistration: boolean;
    lateRegistrationMinutes: number;
    rebuyAllowed: boolean;
    rebuyCount: number;
    addonAllowed: boolean;
  };
  tournamentCount: number;
  playerCount: number;
  totalPrizePool: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface SeriesListDTO {
  series: SeriesDTO[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SeriesSearchDTO {
  seasonId?: string;
  leagueId?: string;
  name?: string;
  isActive?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'startDate' | 'endDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface SeriesSummaryDTO {
  id: string;
  name: string;
  seasonName: string;
  leagueName: string;
  startDate: string;
  endDate: string;
  tournamentCount: number;
  playerCount: number;
  isActive: boolean;
}

export interface SeriesStatsDTO {
  id: string;
  name: string;
  totalTournaments: number;
  completedTournaments: number;
  totalPlayers: number;
  activePlayers: number;
  totalPrizePool: number;
  averageBuyIn: number;
  topPlayers: {
    playerId: string;
    playerName: string;
    points: number;
    wins: number;
    cashouts: number;
  }[];
}
