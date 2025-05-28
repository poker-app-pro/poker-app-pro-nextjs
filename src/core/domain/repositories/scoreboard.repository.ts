import { Scoreboard } from '../entities/scoreboard';

/**
 * Scoreboard Repository Interface
 * Defines the contract for scoreboard data persistence
 */
export interface IScoreboardRepository {
  /**
   * Create a new scoreboard
   */
  create(scoreboard: Scoreboard): Promise<Scoreboard>;

  /**
   * Update an existing scoreboard
   */
  update(scoreboard: Scoreboard): Promise<Scoreboard>;

  /**
   * Delete a scoreboard by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find a scoreboard by ID
   */
  findById(id: string): Promise<Scoreboard | null>;

  /**
   * Find all scoreboards
   */
  findAll(): Promise<Scoreboard[]>;

  /**
   * Find scoreboards by player ID
   */
  findByPlayerId(playerId: string): Promise<Scoreboard[]>;

  /**
   * Find scoreboards by series ID
   */
  findBySeriesId(seriesId: string): Promise<Scoreboard[]>;

  /**
   * Find scoreboards by season ID
   */
  findBySeasonId(seasonId: string): Promise<Scoreboard[]>;

  /**
   * Find a specific player's scoreboard for a series
   */
  findByPlayerAndSeries(playerId: string, seriesId: string): Promise<Scoreboard | null>;

  /**
   * Find scoreboards for a series, ordered by ranking
   */
  findBySeriesIdOrderedByRanking(seriesId: string): Promise<Scoreboard[]>;

  /**
   * Find top N scoreboards for a series
   */
  findTopNBySeriesId(seriesId: string, limit: number): Promise<Scoreboard[]>;

  /**
   * Check if a scoreboard exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check if a player has a scoreboard for a series
   */
  existsForPlayerAndSeries(playerId: string, seriesId: string): Promise<boolean>;

  /**
   * Get player's rank in a series
   */
  getPlayerRankInSeries(playerId: string, seriesId: string): Promise<number | null>;

  /**
   * Count scoreboards in a series
   */
  countBySeriesId(seriesId: string): Promise<number>;

  /**
   * Find scoreboards with tournament count greater than threshold
   */
  findByMinimumTournamentCount(seriesId: string, minCount: number): Promise<Scoreboard[]>;

  /**
   * Find scoreboards by points range
   */
  findByPointsRange(seriesId: string, minPoints: number, maxPoints: number): Promise<Scoreboard[]>;
}
