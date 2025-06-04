import { 
  CreateSeasonDTO, 
  UpdateSeasonDTO, 
  SeasonDTO, 
  SeasonListDTO, 
  SeasonSearchDTO,
  SeasonSummaryDTO,
  SeasonDetailsDTO,
  SeasonStatsDTO
} from '@/src/core/application/dtos/seasons.dto';

/**
 * Season Facade Interface
 * Framework-agnostic interface for season operations
 */
export interface ISeasonFacade {
  /**
   * Create a new season
   */
  createSeason(data: CreateSeasonDTO): Promise<{ success: boolean; data?: SeasonDTO; error?: string }>;

  /**
   * Update an existing season
   */
  updateSeason(data: UpdateSeasonDTO): Promise<{ success: boolean; data?: SeasonDTO; error?: string }>;

  /**
   * Delete a season
   */
  deleteSeason(id: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get a season by ID
   */
  getSeason(id: string): Promise<{ success: boolean; data?: SeasonDTO; error?: string }>;

  /**
   * Get all seasons with optional search parameters
   */
  getAllSeasons(search?: SeasonSearchDTO): Promise<{ success: boolean; data?: SeasonListDTO; error?: string }>;

  /**
   * Get season summary
   */
  getSeasonSummary(id: string): Promise<{ success: boolean; data?: SeasonSummaryDTO; error?: string }>;

  /**
   * Get season details including series, tournaments, and standings
   */
  getSeasonDetails(id: string): Promise<{ success: boolean; data?: SeasonDetailsDTO; error?: string }>;

  /**
   * Get season statistics
   */
  getSeasonStats(id: string): Promise<{ success: boolean; data?: SeasonStatsDTO; error?: string }>;

  /**
   * Get seasons by league
   */
  getSeasonsByLeague(leagueId: string): Promise<{ success: boolean; data?: SeasonDTO[]; error?: string }>;

  /**
   * Get active season for a league
   */
  getActiveSeasonForLeague(leagueId: string): Promise<{ success: boolean; data?: SeasonDTO; error?: string }>;

  /**
   * Activate a season
   */
  activateSeason(id: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Deactivate a season
   */
  deactivateSeason(id: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Check if season exists
   */
  seasonExists(id: string): Promise<{ success: boolean; exists?: boolean; error?: string }>;
}
