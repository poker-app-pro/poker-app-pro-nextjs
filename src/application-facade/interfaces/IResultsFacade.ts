import { 
  CreateResultDTO, 
  UpdateResultDTO, 
  ResultDTO, 
  ResultListDTO, 
  ResultSearchDTO,
  ResultSummaryDTO,
  TournamentResultsDTO,
  PlayerResultsDTO,
  BulkResultsDTO,
  ResultsStatsDTO
} from '@/src/core/application/dtos/results.dto';

/**
 * Results Facade Interface
 * Framework-agnostic interface for tournament results operations
 */
export interface IResultsFacade {
  /**
   * Create a new result
   */
  createResult(data: CreateResultDTO): Promise<{ success: boolean; data?: ResultDTO; error?: string }>;

  /**
   * Update an existing result
   */
  updateResult(data: UpdateResultDTO): Promise<{ success: boolean; data?: ResultDTO; error?: string }>;

  /**
   * Delete a result
   */
  deleteResult(id: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get a result by ID
   */
  getResult(id: string): Promise<{ success: boolean; data?: ResultDTO; error?: string }>;

  /**
   * Get all results with optional search parameters
   */
  getAllResults(search?: ResultSearchDTO): Promise<{ success: boolean; data?: ResultListDTO; error?: string }>;

  /**
   * Get result summary
   */
  getResultSummary(id: string): Promise<{ success: boolean; data?: ResultSummaryDTO; error?: string }>;

  /**
   * Get tournament results
   */
  getTournamentResults(tournamentId: string): Promise<{ success: boolean; data?: TournamentResultsDTO; error?: string }>;

  /**
   * Get player results
   */
  getPlayerResults(playerId: string): Promise<{ success: boolean; data?: PlayerResultsDTO; error?: string }>;

  /**
   * Create bulk results
   */
  createBulkResults(data: BulkResultsDTO): Promise<{ success: boolean; data?: { successful: number; failed: number; errors: any[] }; error?: string }>;

  /**
   * Get results statistics
   */
  getResultsStats(leagueId?: string, seasonId?: string, seriesId?: string): Promise<{ success: boolean; data?: ResultsStatsDTO; error?: string }>;

  /**
   * Calculate points for a tournament
   */
  calculatePoints(tournamentId: string): Promise<{ success: boolean; data?: { updated: number }; error?: string }>;

  /**
   * Recalculate all points for a series
   */
  recalculateSeriesPoints(seriesId: string): Promise<{ success: boolean; data?: { updated: number }; error?: string }>;
}
