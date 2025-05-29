import { 
  CreateQualificationDTO, 
  UpdateQualificationDTO, 
  QualificationDTO, 
  QualificationListDTO, 
  QualificationSearchDTO,
  QualificationSummaryDTO,
  PlayerQualificationStatusDTO,
  QualificationHistoryDTO,
  QualificationStatsDTO,
  BulkQualificationDTO,
  QualificationValidationDTO
} from '@/src/core/application/dtos/qualification.dto';

/**
 * Qualification Facade Interface
 * Framework-agnostic interface for qualification operations
 */
export interface IQualificationFacade {
  /**
   * Create a new qualification
   */
  createQualification(data: CreateQualificationDTO): Promise<{ success: boolean; data?: QualificationDTO; error?: string }>;

  /**
   * Update an existing qualification
   */
  updateQualification(data: UpdateQualificationDTO): Promise<{ success: boolean; data?: QualificationDTO; error?: string }>;

  /**
   * Delete a qualification
   */
  deleteQualification(id: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get a qualification by ID
   */
  getQualification(id: string): Promise<{ success: boolean; data?: QualificationDTO; error?: string }>;

  /**
   * Get all qualifications
   */
  getAllQualifications(search?: QualificationSearchDTO): Promise<{ success: boolean; data?: QualificationListDTO; error?: string }>;

  /**
   * Get qualifications by player
   */
  getQualificationsByPlayer(playerId: string): Promise<{ success: boolean; data?: QualificationDTO[]; error?: string }>;

  /**
   * Get qualifications by event
   */
  getQualificationsByEvent(eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: QualificationDTO[]; error?: string }>;

  /**
   * Get player qualification status for an event
   */
  getPlayerQualificationStatus(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: PlayerQualificationStatusDTO; error?: string }>;

  /**
   * Get player qualification history
   */
  getPlayerQualificationHistory(playerId: string): Promise<{ success: boolean; data?: QualificationHistoryDTO; error?: string }>;

  /**
   * Get qualification statistics for an event
   */
  getQualificationStats(eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: QualificationStatsDTO; error?: string }>;

  /**
   * Validate qualification requirements
   */
  validateQualification(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: QualificationValidationDTO; error?: string }>;

  /**
   * Qualify player automatically based on points
   */
  qualifyPlayerByPoints(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season', userId: string): Promise<{ success: boolean; data?: QualificationDTO; error?: string }>;

  /**
   * Qualify player manually
   */
  qualifyPlayerManually(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season', notes: string, userId: string): Promise<{ success: boolean; data?: QualificationDTO; error?: string }>;

  /**
   * Process payment qualification
   */
  processPaymentQualification(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season', paymentAmount: number, userId: string): Promise<{ success: boolean; data?: QualificationDTO; error?: string }>;

  /**
   * Disqualify player
   */
  disqualifyPlayer(qualificationId: string, reason: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Bulk qualify players
   */
  bulkQualifyPlayers(data: BulkQualificationDTO, userId: string): Promise<{ success: boolean; data?: QualificationDTO[]; error?: string }>;

  /**
   * Check if player is qualified
   */
  isPlayerQualified(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; isQualified?: boolean; error?: string }>;

  /**
   * Get pending qualifications
   */
  getPendingQualifications(eventId?: string, eventType?: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: QualificationDTO[]; error?: string }>;

  /**
   * Get expired qualifications
   */
  getExpiredQualifications(eventId?: string, eventType?: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: QualificationDTO[]; error?: string }>;

  /**
   * Extend qualification deadline
   */
  extendQualificationDeadline(qualificationId: string, newDeadline: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Update payment status
   */
  updatePaymentStatus(qualificationId: string, paymentStatus: 'pending' | 'paid' | 'waived', userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get qualification summary
   */
  getQualificationSummary(id: string): Promise<{ success: boolean; data?: QualificationSummaryDTO; error?: string }>;

  /**
   * Check if qualification exists
   */
  qualificationExists(id: string): Promise<{ success: boolean; exists?: boolean; error?: string }>;
}
