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
   * Get all qualifications with optional search parameters
   */
  getAllQualifications(search?: QualificationSearchDTO): Promise<{ success: boolean; data?: QualificationListDTO; error?: string }>;

  /**
   * Get qualification summary
   */
  getQualificationSummary(id: string): Promise<{ success: boolean; data?: QualificationSummaryDTO; error?: string }>;

  /**
   * Get player qualification status for an event
   */
  getPlayerQualificationStatus(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: PlayerQualificationStatusDTO; error?: string }>;

  /**
   * Get qualification history for a player
   */
  getQualificationHistory(playerId: string): Promise<{ success: boolean; data?: QualificationHistoryDTO; error?: string }>;

  /**
   * Get qualification statistics for an event
   */
  getQualificationStats(eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: QualificationStatsDTO; error?: string }>;

  /**
   * Create bulk qualifications
   */
  createBulkQualifications(data: BulkQualificationDTO): Promise<{ success: boolean; data?: { successful: number; failed: number; errors: any[] }; error?: string }>;

  /**
   * Validate qualification
   */
  validateQualification(playerId: string, eventId: string, eventType: 'tournament' | 'series' | 'season'): Promise<{ success: boolean; data?: QualificationValidationDTO; error?: string }>;
}
