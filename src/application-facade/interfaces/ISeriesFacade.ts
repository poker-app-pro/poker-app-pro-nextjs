import { 
  CreateSeriesDTO, 
  UpdateSeriesDTO, 
  SeriesDTO, 
  SeriesListDTO, 
  SeriesSearchDTO,
  SeriesSummaryDTO,
  SeriesDetailsDTO,
  SeriesStatsDTO
} from '@/src/core/application/dtos/series.dto';

/**
 * Series Facade Interface
 * Framework-agnostic interface for series operations
 */
export interface ISeriesFacade {
  /**
   * Create a new series
   */
  createSeries(data: CreateSeriesDTO): Promise<{ success: boolean; data?: SeriesDTO; error?: string }>;

  /**
   * Update an existing series
   */
  updateSeries(data: UpdateSeriesDTO): Promise<{ success: boolean; data?: SeriesDTO; error?: string }>;

  /**
   * Delete a series
   */
  deleteSeries(id: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get a series by ID
   */
  getSeries(id: string): Promise<{ success: boolean; data?: SeriesDTO; error?: string }>;

  /**
   * Get all series with optional search parameters
   */
  getAllSeries(search?: SeriesSearchDTO): Promise<{ success: boolean; data?: SeriesListDTO; error?: string }>;

  /**
   * Get series summary
   */
  getSeriesSummary(id: string): Promise<{ success: boolean; data?: SeriesSummaryDTO; error?: string }>;

  /**
   * Get series details including tournaments and standings
   */
  getSeriesDetails(id: string): Promise<{ success: boolean; data?: SeriesDetailsDTO; error?: string }>;

  /**
   * Get series statistics
   */
  getSeriesStats(id: string): Promise<{ success: boolean; data?: SeriesStatsDTO; error?: string }>;

  /**
   * Get series by season
   */
  getSeriesBySeason(seasonId: string): Promise<{ success: boolean; data?: SeriesDTO[]; error?: string }>;

  /**
   * Get active series for a season
   */
  getActiveSeriesForSeason(seasonId: string): Promise<{ success: boolean; data?: SeriesDTO; error?: string }>;

  /**
   * Activate a series
   */
  activateSeries(id: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Deactivate a series
   */
  deactivateSeries(id: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Check if series exists
   */
  seriesExists(id: string): Promise<{ success: boolean; exists?: boolean; error?: string }>;
}
