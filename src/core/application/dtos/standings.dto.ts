/**
 * Standings Data Transfer Objects
 * Framework-agnostic data structures for standings operations
 */

export interface StandingEntryDTO {
  playerId: string;
  playerName: string;
  rank: number;
  points: number;
  tournaments: number;
  bestFinish: number;
  averageFinish: number;
  inTheMoney: number;
  inTheMoneyPercentage: number;
  totalPrize: number;
  totalInvestment: number;
  roi: number;
}

export interface StandingsDTO {
  id: string;
  entityId: string; // ID of the league, season, or series
  entityType: 'league' | 'season' | 'series';
  entityName: string;
  entries: StandingEntryDTO[];
  lastUpdated: string;
}

export interface StandingsSearchDTO {
  leagueId?: string;
  seasonId?: string;
  seriesId?: string;
  playerId?: string;
  minRank?: number;
  maxRank?: number;
  minPoints?: number;
  maxPoints?: number;
  minTournaments?: number;
  sortBy?: 'rank' | 'points' | 'tournaments' | 'bestFinish' | 'averageFinish' | 'inTheMoney' | 'totalPrize' | 'roi';
  sortOrder?: 'asc' | 'desc';
}

export interface StandingsFilterDTO {
  minTournaments?: number;
  includeInactive?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface PlayerStandingsDTO {
  playerId: string;
  playerName: string;
  standings: {
    entityId: string;
    entityType: 'league' | 'season' | 'series';
    entityName: string;
    rank: number;
    points: number;
    tournaments: number;
    bestFinish: number;
  }[];
}

export interface StandingsComparisonDTO {
  entityId: string;
  entityType: 'league' | 'season' | 'series';
  entityName: string;
  players: {
    playerId: string;
    playerName: string;
    rank: number;
    points: number;
    tournaments: number;
    bestFinish: number;
    averageFinish: number;
    inTheMoney: number;
    inTheMoneyPercentage: number;
    totalPrize: number;
    roi: number;
  }[];
}

export interface StandingsHistoryDTO {
  playerId: string;
  playerName: string;
  history: {
    date: string;
    rank: number;
    points: number;
    tournaments: number;
  }[];
}

export interface StandingsSnapshotDTO {
  id: string;
  entityId: string;
  entityType: 'league' | 'season' | 'series';
  entityName: string;
  date: string;
  entries: {
    playerId: string;
    playerName: string;
    rank: number;
    points: number;
    tournaments: number;
  }[];
}

export interface StandingsUpdateDTO {
  entityId: string;
  entityType: 'league' | 'season' | 'series';
  forceRecalculate?: boolean;
}
