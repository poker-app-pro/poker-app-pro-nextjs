import { Season } from '../entities/season';

/**
 * Season Repository Interface
 * Defines the contract for season data persistence
 */
export interface ISeasonRepository {
  /**
   * Create a new season
   */
  create(season: Season): Promise<Season>;

  /**
   * Update an existing season
   */
  update(season: Season): Promise<Season>;

  /**
   * Delete a season by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find a season by ID
   */
  findById(id: string): Promise<Season | null>;

  /**
   * Find all seasons
   */
  findAll(): Promise<Season[]>;

  /**
   * Find seasons by league ID
   */
  findByLeagueId(leagueId: string): Promise<Season[]>;

  /**
   * Find active seasons
   */
  findActive(): Promise<Season[]>;

  /**
   * Find currently running seasons
   */
  findCurrentlyActive(): Promise<Season[]>;

  /**
   * Find seasons by date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Season[]>;

  /**
   * Check if a season exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Find seasons by name (partial match)
   */
  findByName(name: string): Promise<Season[]>;

  /**
   * Find the most recent season for a league
   */
  findMostRecentByLeagueId(leagueId: string): Promise<Season | null>;
}
