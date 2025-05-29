import { Player } from '@/src/core/domain/entities/player';

/**
 * Player Repository Interface
 * Defines the contract for player data access
 */
export interface IPlayerRepository {
  /**
   * Save a player (create or update)
   */
  save(player: Player): Promise<Player>;

  /**
   * Find a player by ID
   */
  findById(id: string): Promise<Player | null>;

  /**
   * Find players by criteria
   */
  findMany(criteria: PlayerSearchCriteria): Promise<PlayerSearchResult>;

  /**
   * Find all active players
   */
  findAllActive(): Promise<Player[]>;

  /**
   * Check if a player exists by ID
   */
  exists(id: string): Promise<boolean>;

  /**
   * Delete a player by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Count total players
   */
  count(criteria?: Partial<PlayerSearchCriteria>): Promise<number>;
}

export interface PlayerSearchCriteria {
  query?: string;
  isActive?: boolean;
  joinedAfter?: Date;
  joinedBefore?: Date;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'joinDate';
  sortOrder?: 'asc' | 'desc';
}

export interface PlayerSearchResult {
  players: Player[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
