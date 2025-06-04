/**
 * Results Data Transfer Objects
 * Framework-agnostic data structures for tournament results operations
 */

export interface CreateResultDTO {
  tournamentId: string;
  playerId: string;
  position: number;
  points?: number;
  prize?: number;
  notes?: string;
  eliminatedBy?: string;
  eliminatedAt?: string; // ISO date string
  rebuys?: number;
  addons?: number;
}

export interface UpdateResultDTO {
  id: string;
  position?: number;
  points?: number;
  prize?: number;
  notes?: string;
  eliminatedBy?: string;
  eliminatedAt?: string; // ISO date string
  rebuys?: number;
  addons?: number;
}

export interface ResultDTO {
  id: string;
  tournamentId: string;
  tournamentName: string;
  seriesId?: string;
  seriesName?: string;
  seasonId: string;
  seasonName: string;
  leagueId: string;
  leagueName: string;
  playerId: string;
  playerName: string;
  position: number;
  points: number;
  prize: number;
  notes?: string;
  eliminatedBy?: string;
  eliminatedByPlayerName?: string;
  eliminatedAt?: string;
  rebuys: number;
  addons: number;
  totalInvestment: number;
  roi: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResultListDTO {
  results: ResultDTO[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ResultSearchDTO {
  tournamentId?: string;
  seriesId?: string;
  seasonId?: string;
  leagueId?: string;
  playerId?: string;
  positionMin?: number;
  positionMax?: number;
  pointsMin?: number;
  pointsMax?: number;
  prizeMin?: number;
  prizeMax?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'position' | 'points' | 'prize' | 'playerName' | 'eliminatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ResultSummaryDTO {
  id: string;
  tournamentName: string;
  playerName: string;
  position: number;
  points: number;
  prize: number;
}

export interface TournamentResultsDTO {
  tournamentId: string;
  tournamentName: string;
  tournamentDate: string;
  seriesId?: string;
  seriesName?: string;
  seasonId: string;
  seasonName: string;
  leagueId: string;
  leagueName: string;
  results: {
    id: string;
    playerId: string;
    playerName: string;
    position: number;
    points: number;
    prize: number;
    rebuys: number;
    addons: number;
    totalInvestment: number;
    roi: number;
  }[];
  totalPlayers: number;
  totalPrizePool: number;
  totalPoints: number;
  totalRebuys: number;
  totalAddons: number;
}

export interface PlayerResultsDTO {
  playerId: string;
  playerName: string;
  results: {
    id: string;
    tournamentId: string;
    tournamentName: string;
    tournamentDate: string;
    position: number;
    points: number;
    prize: number;
    rebuys: number;
    addons: number;
    totalInvestment: number;
    roi: number;
  }[];
  totalTournaments: number;
  totalPoints: number;
  totalPrize: number;
  totalInvestment: number;
  totalROI: number;
  bestPosition: number;
  averagePosition: number;
  inTheMoney: number;
  inTheMoneyPercentage: number;
}

export interface BulkResultsDTO {
  tournamentId: string;
  results: {
    playerId: string;
    position: number;
    points?: number;
    prize?: number;
    rebuys?: number;
    addons?: number;
    notes?: string;
  }[];
}

export interface ResultsStatsDTO {
  tournamentCount: number;
  playerCount: number;
  totalPrizePool: number;
  totalPoints: number;
  totalRebuys: number;
  totalAddons: number;
  averagePlayers: number;
  averagePrizePool: number;
  topPerformers: {
    playerId: string;
    playerName: string;
    tournaments: number;
    points: number;
    prize: number;
    bestPosition: number;
    averagePosition: number;
  }[];
}
