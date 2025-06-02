import { 
  CreateSeasonDTO, 
  UpdateSeasonDTO, 
  SeasonDTO, 
  SeasonListDTO, 
  SeasonSearchDTO,
  SeasonWithLeagueDTO
} from '@/src/core/application/dtos/season.dto';

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
   * Get all seasons
   */
  getAllSeasons(search?: SeasonSearchDTO): Promise<{ success: boolean; data?: SeasonListDTO; error?: string }>;

  /**
   * Get seasons by league
   */
  getSeasonsByLeague(leagueId: string): Promise<{ success: boolean; data?: SeasonDTO[]; error?: string }>;

  /**
   * Get active seasons
   */
  getActiveSeasons(leagueId?: string): Promise<{ success: boolean; data?: SeasonDTO[]; error?: string }>;

  /**
   * Get season with league details
   */
  getSeasonWithLeague(id: string): Promise<{ success: boolean; data?: SeasonWithLeagueDTO; error?: string }>;

  /**
   * Check if season exists
   */
  seasonExists(id: string): Promise<{ success: boolean; exists?: boolean; error?: string }>;

  /**
   * Activate/Deactivate season
   */
  toggleSeasonStatus(id: string, isActive: boolean, userId: string): Promise<{ success: boolean; error?: string }>;
}
