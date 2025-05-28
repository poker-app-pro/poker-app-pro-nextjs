/**
 * Scoreboard Data Transfer Objects
 * Framework-agnostic data structures for scoreboard operations
 */

export interface CreateScoreboardEntryDTO {
  playerId: string;
  eventId: string; // Can be tournament, series, or season ID
  eventType: 'tournament' | 'series' | 'season';
  points: number;
  position?: number;
  gamesPlayed?: number;
  wins?: number;
  cashouts?: number;
  totalWinnings?: number;
  averagePosition?: number;
  bestFinish?: number;
  worstFinish?: number;
  lastUpdated: string; // ISO date string
}

export interface UpdateScoreboardEntryDTO {
  id: string;
  points?: number;
  position?: number;
  gamesPlayed?: number;
  wins?: number;
  cashouts?: number;
  totalWinnings?: number;
  averagePosition?: number;
  bestFinish?: number;
  worstFinish?: number;
  lastUpdated: string;
}

export interface ScoreboardEntryDTO {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  eventId: string;
  eventName: string;
  eventType: 'tournament' | 'series' | 'season';
  seriesId?: string;
  seriesName?: string;
  seasonId: string;
  seasonName: string;
  leagueId: string;
  leagueName: string;
  points: number;
  position: number;
  previousPosition?: number;
  positionChange: number; // +/- from previous position
  gamesPlayed: number;
  wins: number;
  cashouts: number;
  totalWinnings: number;
  averagePosition: number;
  bestFinish: number;
  worstFinish: number;
  winRate: number; // percentage
  cashoutRate: number; // percentage
  averageWinnings: number;
  pointsPerGame: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreboardDTO {
  eventId: string;
  eventName: string;
  eventType: 'tournament' | 'series' | 'season';
  seriesId?: string;
  seriesName?: string;
  seasonId: string;
  seasonName: string;
  leagueId: string;
  leagueName: string;
  entries: ScoreboardEntryDTO[];
  totalPlayers: number;
  lastUpdated: string;
  metadata: {
    totalGames: number;
    totalPrizePool: number;
    averagePlayersPerGame: number;
    topPerformer: {
      playerId: string;
      playerName: string;
      points: number;
    };
    mostImproved: {
      playerId: string;
      playerName: string;
      positionChange: number;
    };
  };
}

export interface ScoreboardSearchDTO {
  eventId?: string;
  eventType?: 'tournament' | 'series' | 'season';
  seriesId?: string;
  seasonId?: string;
  leagueId?: string;
  playerId?: string;
  minPoints?: number;
  maxPoints?: number;
  minPosition?: number;
  maxPosition?: number;
  minGamesPlayed?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'position' | 'points' | 'gamesPlayed' | 'wins' | 'winRate' | 'totalWinnings' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}

export interface PlayerScoreboardSummaryDTO {
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  scoreboards: {
    eventId: string;
    eventName: string;
    eventType: 'tournament' | 'series' | 'season';
    position: number;
    points: number;
    gamesPlayed: number;
    wins: number;
    totalWinnings: number;
    lastUpdated: string;
  }[];
  overallStats: {
    totalEvents: number;
    totalPoints: number;
    totalGames: number;
    totalWins: number;
    totalWinnings: number;
    averagePosition: number;
    bestPosition: number;
    winRate: number;
    cashoutRate: number;
  };
}

export interface ScoreboardComparisonDTO {
  players: {
    playerId: string;
    playerName: string;
    stats: {
      eventId: string;
      eventName: string;
      position: number;
      points: number;
      gamesPlayed: number;
      wins: number;
      winRate: number;
      totalWinnings: number;
    }[];
  }[];
  comparisonMetrics: {
    metric: string;
    values: {
      playerId: string;
      value: number;
      rank: number;
    }[];
  }[];
}

export interface ScoreboardHistoryDTO {
  eventId: string;
  eventName: string;
  eventType: 'tournament' | 'series' | 'season';
  playerId: string;
  playerName: string;
  history: {
    date: string;
    position: number;
    points: number;
    gamesPlayed: number;
    wins: number;
    totalWinnings: number;
    positionChange: number;
  }[];
  trends: {
    positionTrend: 'improving' | 'declining' | 'stable';
    pointsTrend: 'increasing' | 'decreasing' | 'stable';
    winRateTrend: 'improving' | 'declining' | 'stable';
  };
}

export interface ScoreboardStatsDTO {
  eventId: string;
  eventName: string;
  eventType: 'tournament' | 'series' | 'season';
  totalPlayers: number;
  activePlayersLastWeek: number;
  activePlayersLastMonth: number;
  averagePointsPerPlayer: number;
  medianPointsPerPlayer: number;
  totalGamesPlayed: number;
  totalPrizePool: number;
  distributionStats: {
    topTenPercent: {
      playerCount: number;
      averagePoints: number;
      totalWinnings: number;
    };
    middleFiftyPercent: {
      playerCount: number;
      averagePoints: number;
      totalWinnings: number;
    };
    bottomFortyPercent: {
      playerCount: number;
      averagePoints: number;
      totalWinnings: number;
    };
  };
  competitiveBalance: {
    pointsSpread: number;
    giniCoefficient: number; // Measure of inequality
    competitivenessIndex: number; // 0-100 scale
  };
}

export interface BulkScoreboardUpdateDTO {
  eventId: string;
  eventType: 'tournament' | 'series' | 'season';
  updates: {
    playerId: string;
    points: number;
    gamesPlayed?: number;
    wins?: number;
    cashouts?: number;
    totalWinnings?: number;
  }[];
  lastUpdated: string;
}

export interface ScoreboardRecalculationDTO {
  eventId: string;
  eventType: 'tournament' | 'series' | 'season';
  recalculationType: 'full' | 'incremental' | 'positions_only';
  affectedPlayerIds?: string[];
  reason: string;
  requestedBy: string;
  requestedAt: string;
}
