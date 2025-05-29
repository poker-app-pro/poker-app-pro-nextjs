import { Player } from '@/src/core/domain/entities/player';

export interface PlayerProfile {
  player: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    joinDate: string;
    isActive: boolean;
    profileImageUrl?: string;
    notes?: string;
    preferredGameTypes?: string[];
  };
  stats: {
    totalTournaments: number;
    totalWins: number;
    totalPoints: number;
    bestFinish: number;
    regularPoints: number;
    bountyPoints: number;
    consolationPoints: number;
    bountyCount: number;
    consolationCount: number;
  };
  tournamentResults: {
    id: string;
    tournamentId: string;
    tournamentName: string;
    seriesId: string;
    seriesName: string;
    seasonId: string;
    seasonName: string;
    date: string;
    finalPosition: number;
    points: number;
    bountyPoints: number;
    consolationPoints: number;
    totalPoints: number;
    bountyCount: number;
    isConsolation: boolean;
  }[];
  seriesScoreboards: {
    id: string;
    seriesId: string;
    seriesName: string;
    seasonId: string;
    seasonName: string;
    tournamentCount: number;
    bestFinish: number;
    totalPoints: number;
    regularPoints: number;
    bountyPoints: number;
    consolationPoints: number;
    bountyCount: number;
    consolationCount: number;
  }[];
  qualifications: {
    id: string;
    seasonEventName: string;
    chipCount: number;
    qualified: boolean;
    finalPosition: number | null;
  }[];
}

export interface PlayerListItem {
  id: string;
  name: string;
  joinedDate: string;
  tournamentCount: number;
  bestFinish: number;
  totalPoints: number;
  isActive: boolean;
}

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

  /**
   * Get detailed player profile with stats and history
   */
  getPlayerProfile(playerId: string): Promise<PlayerProfile | null>;

  /**
   * Get players list with pagination and search
   */
  getPlayersList(searchTerm?: string, page?: number, pageSize?: number): Promise<{
    players: PlayerListItem[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  }>;
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
