import { 
  CreateScoreboardEntryDTO, 
  UpdateScoreboardEntryDTO, 
  ScoreboardEntryDTO, 
  ScoreboardDTO, 
  ScoreboardSearchDTO,
  PlayerScoreboardSummaryDTO,
  ScoreboardComparisonDTO,
  ScoreboardHistoryDTO,
  ScoreboardStatsDTO,
  BulkScoreboardUpdateDTO,
  ScoreboardRecalculationDTO
} from '../../core/application/dtos/scoreboard.dto';

/**
 * Scoreboard Facade Interface
 * Framework-agnostic interface for scoreboard operations
 */
export interface IScoreboardFacade {
  /**
   * Create a new scoreboard entry
   */
  createScoreboardEntry(data: CreateScoreboardEntryDTO): Promise<{ success: boolean; data?: ScoreboardEntryDTO; error?: string }>;

  /**
   * Update an existing scoreboard entry
   */
  updateScoreboardEntry(data: UpdateScoreboardEntryDTO): Promise<{ success: boolean; data?: ScoreboardEntryDTO; error?: string }>;

  /**
   * Delete a scoreboard entry
   */
  deleteScoreboardEntry(id: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get a scoreboard entry by ID
   */
  getScoreboardEntry(id: string): Promise<{ success: boolean; data?: ScoreboardEntryDTO; error?: string }>;

  /**
   * Get complete scoreboard for an event
   */
  getScoreboard(eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: ScoreboardDTO; error?: string }>;

  /**
   * Search scoreboard entries
   */
  searchScoreboardEntries(search: ScoreboardSearchDTO): Promise<{ success: boolean; data?: ScoreboardEntryDTO[]; error?: string }>;

  /**
   * Get player's scoreboard summary across all events
   */
  getPlayerScoreboardSummary(playerId: string): Promise<{ success: boolean; data?: PlayerScoreboardSummaryDTO; error?: string }>;

  /**
   * Get scoreboard entries by player
   */
  getScoreboardEntriesByPlayer(playerId: string): Promise<{ success: boolean; data?: ScoreboardEntryDTO[]; error?: string }>;

  /**
   * Get scoreboard entries by event
   */
  getScoreboardEntriesByEvent(eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: ScoreboardEntryDTO[]; error?: string }>;

  /**
   * Get top performers for an event
   */
  getTopPerformers(eventId: string, eventType: 'tournament' | 'series' | 'season', limit?: number): Promise<{ success: boolean; data?: ScoreboardEntryDTO[]; error?: string }>;

  /**
   * Get player's position in scoreboard
   */
  getPlayerPosition(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; position?: number; error?: string }>;

  /**
   * Compare players' performance
   */
  comparePlayerPerformance(playerIds: string[], eventId?: string, eventType?: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: ScoreboardComparisonDTO; error?: string }>;

  /**
   * Get scoreboard history for a player
   */
  getScoreboardHistory(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: ScoreboardHistoryDTO; error?: string }>;

  /**
   * Get scoreboard statistics
   */
  getScoreboardStats(eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: ScoreboardStatsDTO; error?: string }>;

  /**
   * Update player points
   */
  updatePlayerPoints(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season', points: number, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Bulk update scoreboard entries
   */
  bulkUpdateScoreboard(data: BulkScoreboardUpdateDTO, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Recalculate scoreboard positions
   */
  recalculatePositions(eventId: string, eventType: 'tournament' | 'series' | 'season', userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Recalculate entire scoreboard
   */
  recalculateScoreboard(data: ScoreboardRecalculationDTO): Promise<{ success: boolean; error?: string }>;

  /**
   * Get leaderboard for multiple events
   */
  getLeaderboard(eventIds: string[], eventType: 'tournament' | 'series' | 'season', limit?: number): Promise<{ success: boolean; data?: ScoreboardEntryDTO[]; error?: string }>;

  /**
   * Get player's rank across all events
   */
  getPlayerOverallRank(playerId: string): Promise<{ success: boolean; rank?: number; totalPlayers?: number; error?: string }>;

  /**
   * Get most improved players
   */
  getMostImprovedPlayers(eventId: string, eventType: 'tournament' | 'series' | 'season', limit?: number): Promise<{ success: boolean; data?: ScoreboardEntryDTO[]; error?: string }>;

  /**
   * Get players by position range
   */
  getPlayersByPositionRange(eventId: string, eventType: 'tournament' | 'series' | 'season', startPosition: number, endPosition: number): Promise<{ success: boolean; data?: ScoreboardEntryDTO[]; error?: string }>;

  /**
   * Check if scoreboard entry exists
   */
  scoreboardEntryExists(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; exists?: boolean; error?: string }>;

  /**
   * Reset scoreboard for an event
   */
  resetScoreboard(eventId: string, eventType: 'tournament' | 'series' | 'season', userId: string): Promise<{ success: boolean; error?: string }>;
}
