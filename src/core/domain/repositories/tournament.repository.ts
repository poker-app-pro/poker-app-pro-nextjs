import { Tournament } from '@/src/core/domain/entities/tournament';

/**
 * Tournament Repository Interface
 * Defines the contract for tournament data persistence
 */
export interface ITournamentRepository {
  /**
   * Create a new tournament
   */
  create(tournament: Tournament): Promise<Tournament>;

  /**
   * Update an existing tournament
   */
  update(tournament: Tournament): Promise<Tournament>;

  /**
   * Delete a tournament by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find a tournament by ID
   */
  findById(id: string): Promise<Tournament | null>;

  /**
   * Find all tournaments
   */
  findAll(): Promise<Tournament[]>;

  /**
   * Find tournaments by series ID
   */
  findBySeriesId(seriesId: string): Promise<Tournament[]>;

  /**
   * Find tournaments by season ID
   */
  findBySeasonId(seasonId: string): Promise<Tournament[]>;

  /**
   * Find active tournaments
   */
  findActive(): Promise<Tournament[]>;

  /**
   * Find tournaments by date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Tournament[]>;

  /**
   * Find upcoming tournaments
   */
  findUpcoming(): Promise<Tournament[]>;

  /**
   * Find completed tournaments
   */
  findCompleted(): Promise<Tournament[]>;

  /**
   * Find tournaments scheduled for today
   */
  findToday(): Promise<Tournament[]>;

  /**
   * Check if a tournament exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Find tournaments by name (partial match)
   */
  findByName(name: string): Promise<Tournament[]>;

  /**
   * Find the most recent tournament for a series
   */
  findMostRecentBySeriesId(seriesId: string): Promise<Tournament | null>;

  /**
   * Count tournaments in a series
   */
  countBySeriesId(seriesId: string): Promise<number>;
}
