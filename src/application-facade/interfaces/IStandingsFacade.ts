import { 
  StandingsDTO, 
  StandingsSearchDTO, 
  StandingsFilterDTO,
  PlayerStandingsDTO,
  StandingsComparisonDTO,
  StandingsHistoryDTO,
  StandingsSnapshotDTO,
  StandingsUpdateDTO
} from '@/src/core/application/dtos/standings.dto';

/**
 * Standings Facade Interface
 * Framework-agnostic interface for standings operations
 */
export interface IStandingsFacade {
  /**
   * Get standings for a league, season, or series
   */
  getStandings(
    entityId: string, 
    entityType: 'league' | 'season' | 'series', 
    filter?: StandingsFilterDTO
  ): Promise<{ success: boolean; data?: StandingsDTO; error?: string }>;

  /**
   * Search standings with various criteria
   */
  searchStandings(
    search: StandingsSearchDTO
  ): Promise<{ success: boolean; data?: StandingsDTO; error?: string }>;

  /**
   * Get standings for a player across all leagues, seasons, or series
   */
  getPlayerStandings(
    playerId: string
  ): Promise<{ success: boolean; data?: PlayerStandingsDTO; error?: string }>;

  /**
   * Compare standings for multiple players
   */
  compareStandings(
    entityId: string,
    entityType: 'league' | 'season' | 'series',
    playerIds: string[]
  ): Promise<{ success: boolean; data?: StandingsComparisonDTO; error?: string }>;

  /**
   * Get standings history for a player
   */
  getStandingsHistory(
    playerId: string,
    entityId: string,
    entityType: 'league' | 'season' | 'series'
  ): Promise<{ success: boolean; data?: StandingsHistoryDTO; error?: string }>;

  /**
   * Get a snapshot of standings at a specific date
   */
  getStandingsSnapshot(
    entityId: string,
    entityType: 'league' | 'season' | 'series',
    date: string
  ): Promise<{ success: boolean; data?: StandingsSnapshotDTO; error?: string }>;

  /**
   * Update standings for a league, season, or series
   */
  updateStandings(
    data: StandingsUpdateDTO
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Get top performers across all leagues, seasons, or series
   */
  getTopPerformers(
    count?: number,
    entityType?: 'league' | 'season' | 'series'
  ): Promise<{ success: boolean; data?: { playerId: string; playerName: string; points: number; tournaments: number }[]; error?: string }>;
}
