import { 
  CreateTournamentDTO, 
  UpdateTournamentDTO, 
  TournamentDTO, 
  TournamentListDTO, 
  TournamentSearchDTO,
  TournamentSummaryDTO,
  TournamentRegistrationDTO,
  TournamentResultDTO,
  TournamentStatsDTO
} from '@/src/core/application/dtos/tournament.dto';

/**
 * Tournament Facade Interface
 * Framework-agnostic interface for tournament operations
 */
export interface ITournamentFacade {
  /**
   * Create a new tournament
   */
  createTournament(data: CreateTournamentDTO): Promise<{ success: boolean; data?: TournamentDTO; error?: string }>;

  /**
   * Update an existing tournament
   */
  updateTournament(data: UpdateTournamentDTO): Promise<{ success: boolean; data?: TournamentDTO; error?: string }>;

  /**
   * Delete a tournament
   */
  deleteTournament(id: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get a tournament by ID
   */
  getTournament(id: string): Promise<{ success: boolean; data?: TournamentDTO; error?: string }>;

  /**
   * Get all tournaments
   */
  getAllTournaments(search?: TournamentSearchDTO): Promise<{ success: boolean; data?: TournamentListDTO; error?: string }>;

  /**
   * Get tournaments by series
   */
  getTournamentsBySeries(seriesId: string): Promise<{ success: boolean; data?: TournamentDTO[]; error?: string }>;

  /**
   * Get tournaments by season
   */
  getTournamentsBySeason(seasonId: string): Promise<{ success: boolean; data?: TournamentDTO[]; error?: string }>;

  /**
   * Get tournaments by league
   */
  getTournamentsByLeague(leagueId: string): Promise<{ success: boolean; data?: TournamentDTO[]; error?: string }>;

  /**
   * Get tournaments by status
   */
  getTournamentsByStatus(status: 'scheduled' | 'registration' | 'active' | 'completed' | 'cancelled'): Promise<{ success: boolean; data?: TournamentDTO[]; error?: string }>;

  /**
   * Get tournament summary
   */
  getTournamentSummary(id: string): Promise<{ success: boolean; data?: TournamentSummaryDTO; error?: string }>;

  /**
   * Get tournament statistics
   */
  getTournamentStats(id: string): Promise<{ success: boolean; data?: TournamentStatsDTO; error?: string }>;

  /**
   * Register player for tournament
   */
  registerPlayer(tournamentId: string, playerId: string, userId: string): Promise<{ success: boolean; data?: TournamentRegistrationDTO; error?: string }>;

  /**
   * Unregister player from tournament
   */
  unregisterPlayer(tournamentId: string, playerId: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get tournament registrations
   */
  getTournamentRegistrations(tournamentId: string): Promise<{ success: boolean; data?: TournamentRegistrationDTO[]; error?: string }>;

  /**
   * Start tournament
   */
  startTournament(id: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Complete tournament
   */
  completeTournament(id: string, results: TournamentResultDTO[], userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Cancel tournament
   */
  cancelTournament(id: string, reason: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get tournament results
   */
  getTournamentResults(tournamentId: string): Promise<{ success: boolean; data?: TournamentResultDTO[]; error?: string }>;

  /**
   * Update tournament status
   */
  updateTournamentStatus(id: string, status: 'scheduled' | 'registration' | 'active' | 'completed' | 'cancelled', userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Check if tournament exists
   */
  tournamentExists(id: string): Promise<{ success: boolean; exists?: boolean; error?: string }>;

  /**
   * Check if player is registered
   */
  isPlayerRegistered(tournamentId: string, playerId: string): Promise<{ success: boolean; isRegistered?: boolean; error?: string }>;

  /**
   * Get upcoming tournaments
   */
  getUpcomingTournaments(days?: number): Promise<{ success: boolean; data?: TournamentDTO[]; error?: string }>;

  /**
   * Get recent tournaments
   */
  getRecentTournaments(days?: number): Promise<{ success: boolean; data?: TournamentDTO[]; error?: string }>;
}
