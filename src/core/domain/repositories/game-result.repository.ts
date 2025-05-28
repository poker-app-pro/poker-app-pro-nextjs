import { GameResult } from '../entities/game-result';

/**
 * GameResult Repository Interface
 * Defines the contract for game result data access
 */
export interface IGameResultRepository {
  /**
   * Save a game result (create or update)
   */
  save(gameResult: GameResult): Promise<GameResult>;

  /**
   * Find a game result by ID
   */
  findById(id: string): Promise<GameResult | null>;

  /**
   * Find game results by criteria
   */
  findMany(criteria: GameResultSearchCriteria): Promise<GameResultSearchResult>;

  /**
   * Find all results for a specific tournament
   */
  findByTournamentId(tournamentId: string): Promise<GameResult[]>;

  /**
   * Find all results for a specific player
   */
  findByPlayerId(playerId: string): Promise<GameResult[]>;

  /**
   * Find results by player and tournament
   */
  findByPlayerAndTournament(playerId: string, tournamentId: string): Promise<GameResult[]>;

  /**
   * Check if a game result exists by ID
   */
  exists(id: string): Promise<boolean>;

  /**
   * Delete a game result by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Count total game results
   */
  count(criteria?: Partial<GameResultSearchCriteria>): Promise<number>;

  /**
   * Get leaderboard for a tournament
   */
  getLeaderboard(tournamentId: string): Promise<GameResult[]>;

  /**
   * Get player statistics
   */
  getPlayerStats(playerId: string): Promise<PlayerStats>;
}

export interface GameResultSearchCriteria {
  tournamentId?: string;
  playerId?: string;
  minPosition?: number;
  maxPosition?: number;
  minPoints?: number;
  earnedPoints?: boolean;
  isConsolation?: boolean;
  gameTimeAfter?: Date;
  gameTimeBefore?: Date;
  page?: number;
  pageSize?: number;
  sortBy?: 'position' | 'points' | 'gameTime' | 'totalPoints';
  sortOrder?: 'asc' | 'desc';
}

export interface GameResultSearchResult {
  results: GameResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PlayerStats {
  playerId: string;
  totalTournaments: number;
  totalPoints: number;
  averagePosition: number;
  bestPosition: number;
  worstPosition: number;
  wins: number;
  topThreeFinishes: number;
  pointsEarned: number;
  totalBounties: number;
  consolationTournaments: number;
}
