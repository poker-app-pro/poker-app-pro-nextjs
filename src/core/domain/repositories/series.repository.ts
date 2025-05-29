import { Series } from '@/src/core/domain/entities/series';

/**
 * Series Repository Interface
 * Defines the contract for series data persistence
 */
export interface ISeriesRepository {
  /**
   * Create a new series
   */
  create(series: Series): Promise<Series>;

  /**
   * Update an existing series
   */
  update(series: Series): Promise<Series>;

  /**
   * Delete a series by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find a series by ID
   */
  findById(id: string): Promise<Series | null>;

  /**
   * Find all series
   */
  findAll(): Promise<Series[]>;

  /**
   * Find series by season ID
   */
  findBySeasonId(seasonId: string): Promise<Series[]>;

  /**
   * Find active series
   */
  findActive(): Promise<Series[]>;

  /**
   * Find currently running series
   */
  findCurrentlyActive(): Promise<Series[]>;

  /**
   * Find series by date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Series[]>;

  /**
   * Check if a series exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Find series by name (partial match)
   */
  findByName(name: string): Promise<Series[]>;

  /**
   * Find the most recent series for a season
   */
  findMostRecentBySeasonId(seasonId: string): Promise<Series | null>;
}
