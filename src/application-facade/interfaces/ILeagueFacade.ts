import { 
  CreateLeagueDTO, 
  UpdateLeagueDTO, 
  LeagueDTO, 
  LeagueListDTO, 
  LeagueSearchDTO
} from '@/src/core/application/dtos/league.dto';

/**
 * League Facade Interface
 * Framework-agnostic interface for league operations
 */
export interface ILeagueFacade {
  /**
   * Create a new league
   */
  createLeague(data: CreateLeagueDTO): Promise<{ success: boolean; data?: LeagueDTO; error?: string }>;

  /**
   * Update an existing league
   */
  updateLeague(data: UpdateLeagueDTO): Promise<{ success: boolean; data?: LeagueDTO; error?: string }>;

  /**
   * Delete a league
   */
  deleteLeague(id: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get a league by ID
   */
  getLeague(id: string): Promise<{ success: boolean; data?: LeagueDTO; error?: string }>;

  /**
   * Get all leagues
   */
  getAllLeagues(search?: LeagueSearchDTO): Promise<{ success: boolean; data?: LeagueListDTO; error?: string }>;

  /**
   * Get leagues by user
   */
  getLeaguesByUser(userId: string): Promise<{ success: boolean; data?: LeagueDTO[]; error?: string }>;

  /**
   * Check if league exists
   */
  leagueExists(id: string): Promise<{ success: boolean; exists?: boolean; error?: string }>;

  /**
   * Add user to league
   */
  addUserToLeague(leagueId: string, userId: string, role: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Remove user from league
   */
  removeUserFromLeague(leagueId: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get league users
   */
  getLeagueUsers(leagueId: string): Promise<{ success: boolean; data?: { userId: string; role: string }[]; error?: string }>;
}
