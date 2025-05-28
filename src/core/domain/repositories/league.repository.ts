import { League } from '../entities/league';

/**
 * League Repository Interface
 * Defines the contract for league data persistence
 */
export interface ILeagueRepository {
  /**
   * Create a new league
   */
  create(league: League): Promise<League>;

  /**
   * Update an existing league
   */
  update(league: League): Promise<League>;

  /**
   * Delete a league by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find a league by ID
   */
  findById(id: string): Promise<League | null>;

  /**
   * Find all leagues
   */
  findAll(): Promise<League[]>;

  /**
   * Find leagues by owner ID
   */
  findByOwnerId(ownerId: string): Promise<League[]>;

  /**
   * Find active leagues
   */
  findActive(): Promise<League[]>;

  /**
   * Check if a league exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Find leagues by name (partial match)
   */
  findByName(name: string): Promise<League[]>;
}
