import { ISeriesFacade } from '@/src/application-facade/interfaces/ISeriesFacade';
import { 
  CreateSeriesDTO, 
  UpdateSeriesDTO, 
  SeriesDTO, 
  SeriesListDTO,
  SeriesSearchDTO,
  SeriesSummaryDTO,
  SeriesStatsDTO
} from '@/src/core/application/dtos/series.dto';
import { ISeriesRepository } from '@/src/core/domain/repositories/series.repository';
import { IAuthService } from '@/src/infrastructure/services/amplify-auth.service';
import { Series } from '@/src/core/domain/entities/series';
import { GameTime } from '@/src/core/domain/value-objects/game-time';

/**
 * Series Facade Implementation
 * Orchestrates series operations by coordinating between domain services,
 * repositories, and application logic while remaining framework-agnostic
 */
export class SeriesFacade implements ISeriesFacade {
  constructor(
    private readonly seriesRepository: ISeriesRepository,
    private readonly authService: IAuthService
  ) {}

  async createSeries(data: CreateSeriesDTO): Promise<{ success: boolean; data?: SeriesDTO; error?: string }> {
    try {
      // Validate user permissions
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId) {
        return { success: false, error: 'User not authenticated' };
      }

      // Create domain entity
      const series = Series.create(
        crypto.randomUUID(),
        data.name,
        data.seasonId,
        new GameTime(data.startDate),
        new GameTime(data.endDate),
        {
          description: data.description,
          isActive: data.isActive ?? true,
        }
      );

      // Save to repository
      const savedSeries = await this.seriesRepository.create(series);

      // Convert to response DTO
      const responseDTO = await this.toSeriesDTO(savedSeries);

      return { success: true, data: responseDTO };
    } catch (error) {
      console.error('Error creating series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create series' 
      };
    }
  }

  async updateSeries(data: UpdateSeriesDTO): Promise<{ success: boolean; data?: SeriesDTO; error?: string }> {
    try {
      // Validate user permissions
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get existing series
      const existingSeries = await this.seriesRepository.findById(data.id);
      if (!existingSeries) {
        return { success: false, error: 'Series not found' };
      }

      // Update series properties
      if (data.name !== undefined) {
        existingSeries.updateName(data.name);
      }
      if (data.description !== undefined) {
        existingSeries.updateDescription(data.description);
      }
      if (data.startDate !== undefined && data.endDate !== undefined) {
        existingSeries.updateDates(
          new GameTime(data.startDate),
          new GameTime(data.endDate)
        );
      }
      if (data.isActive !== undefined) {
        if (data.isActive) {
          existingSeries.activate();
        } else {
          existingSeries.deactivate();
        }
      }

      // Save updated series
      const updatedSeries = await this.seriesRepository.update(existingSeries);

      // Convert to response DTO
      const responseDTO = await this.toSeriesDTO(updatedSeries);

      return { success: true, data: responseDTO };
    } catch (error) {
      console.error('Error updating series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update series' 
      };
    }
  }

  async deleteSeries(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate user permissions
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId || currentUserId !== userId) {
        return { success: false, error: 'Unauthorized to delete series' };
      }

      // Check if series exists
      const exists = await this.seriesRepository.exists(id);
      if (!exists) {
        return { success: false, error: 'Series not found' };
      }

      // Delete series
      await this.seriesRepository.delete(id);

      return { success: true };
    } catch (error) {
      console.error('Error deleting series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete series' 
      };
    }
  }

  async getSeries(id: string): Promise<{ success: boolean; data?: SeriesDTO; error?: string }> {
    try {
      const series = await this.seriesRepository.findById(id);
      
      if (!series) {
        return { success: false, error: 'Series not found' };
      }

      const responseDTO = await this.toSeriesDTO(series);
      return { success: true, data: responseDTO };
    } catch (error) {
      console.error('Error getting series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get series' 
      };
    }
  }

  async getAllSeries(search?: SeriesSearchDTO): Promise<{ success: boolean; data?: SeriesListDTO; error?: string }> {
    try {
      let seriesList: Series[];

      if (search?.name) {
        seriesList = await this.seriesRepository.findByName(search.name);
      } else {
        seriesList = await this.seriesRepository.findAll();
      }

      // Apply additional filters if provided
      if (search?.seasonId) {
        seriesList = seriesList.filter(s => s.seasonId === search.seasonId);
      }
      if (search?.isActive !== undefined) {
        seriesList = seriesList.filter(s => s.isActive === search.isActive);
      }

      // Apply pagination
      const page = search?.page || 1;
      const pageSize = search?.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedSeries = seriesList.slice(startIndex, endIndex);

      // Convert to DTOs
      const seriesDTOs = await Promise.all(
        paginatedSeries.map(series => this.toSeriesDTO(series))
      );

      const listDTO: SeriesListDTO = {
        series: seriesDTOs,
        total: seriesList.length,
        page,
        pageSize,
        hasMore: endIndex < seriesList.length,
      };

      return { success: true, data: listDTO };
    } catch (error) {
      console.error('Error getting all series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get series' 
      };
    }
  }

  async getSeriesBySeason(seasonId: string): Promise<{ success: boolean; data?: SeriesDTO[]; error?: string }> {
    try {
      const seriesList = await this.seriesRepository.findBySeasonId(seasonId);
      const responseDTOs = await Promise.all(
        seriesList.map(series => this.toSeriesDTO(series))
      );
      return { success: true, data: responseDTOs };
    } catch (error) {
      console.error('Error getting series by season:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get series by season' 
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSeriesByLeague(_leagueId: string): Promise<{ success: boolean; data?: SeriesDTO[]; error?: string }> {
    try {
      // Note: This would need to be implemented in the repository or we need to query by season first
      // For now, return empty array as this requires additional logic
      return { success: true, data: [] };
    } catch (error) {
      console.error('Error getting series by league:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get series by league' 
      };
    }
  }

  async getActiveSeries(seasonId?: string): Promise<{ success: boolean; data?: SeriesDTO[]; error?: string }> {
    try {
      const seriesList = await this.seriesRepository.findActive();
      
      // Filter by season if provided
      const filteredSeries = seasonId 
        ? seriesList.filter(s => s.seasonId === seasonId)
        : seriesList;

      const responseDTOs = await Promise.all(
        filteredSeries.map(series => this.toSeriesDTO(series))
      );
      return { success: true, data: responseDTOs };
    } catch (error) {
      console.error('Error getting active series:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get active series' 
      };
    }
  }

  async getSeriesSummary(id: string): Promise<{ success: boolean; data?: SeriesSummaryDTO; error?: string }> {
    try {
      const series = await this.seriesRepository.findById(id);
      
      if (!series) {
        return { success: false, error: 'Series not found' };
      }

      // Create summary DTO (would need tournament repository to get actual counts)
      const summaryDTO: SeriesSummaryDTO = {
        id: series.id,
        name: series.name,
        seasonName: 'Season Name', // TODO: Get from season repository
        leagueName: 'League Name', // TODO: Get from league repository
        startDate: series.startDate.value.toISOString(),
        endDate: series.endDate.value.toISOString(),
        tournamentCount: 0, // TODO: Get from tournament repository
        playerCount: 0, // TODO: Calculate from tournaments
        isActive: series.isActive,
      };

      return { success: true, data: summaryDTO };
    } catch (error) {
      console.error('Error getting series summary:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get series summary' 
      };
    }
  }

  async getSeriesStats(id: string): Promise<{ success: boolean; data?: SeriesStatsDTO; error?: string }> {
    try {
      const series = await this.seriesRepository.findById(id);
      
      if (!series) {
        return { success: false, error: 'Series not found' };
      }

      // Create stats DTO (would need tournament and player repositories for actual stats)
      const statsDTO: SeriesStatsDTO = {
        id: series.id,
        name: series.name,
        totalTournaments: 0, // TODO: Get from tournament repository
        completedTournaments: 0, // TODO: Get from tournament repository
        totalPlayers: 0, // TODO: Calculate from tournaments
        activePlayers: 0, // TODO: Calculate from tournaments
        totalPrizePool: 0, // TODO: Calculate from tournaments
        averageBuyIn: 0, // TODO: Calculate
        topPlayers: [], // TODO: Get from scoreboard repository
      };

      return { success: true, data: statsDTO };
    } catch (error) {
      console.error('Error getting series stats:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get series stats' 
      };
    }
  }

  async toggleSeriesStatus(id: string, isActive: boolean, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate user permissions
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId || currentUserId !== userId) {
        return { success: false, error: 'Unauthorized to modify series' };
      }

      // Get existing series
      const series = await this.seriesRepository.findById(id);
      if (!series) {
        return { success: false, error: 'Series not found' };
      }

      // Toggle status
      if (isActive) {
        series.activate();
      } else {
        series.deactivate();
      }

      // Save updated series
      await this.seriesRepository.update(series);

      return { success: true };
    } catch (error) {
      console.error('Error toggling series status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to toggle series status' 
      };
    }
  }

  async seriesExists(id: string): Promise<{ success: boolean; exists?: boolean; error?: string }> {
    try {
      const exists = await this.seriesRepository.exists(id);
      return { success: true, exists };
    } catch (error) {
      console.error('Error checking if series exists:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check series existence' 
      };
    }
  }

  private async toSeriesDTO(series: Series): Promise<SeriesDTO> {
    // TODO: Get actual season and league names from repositories
    return {
      id: series.id,
      name: series.name,
      description: series.description,
      seasonId: series.seasonId,
      seasonName: 'Season Name', // TODO: Get from season repository
      leagueId: 'league-id', // TODO: Get from season repository
      leagueName: 'League Name', // TODO: Get from league repository
      startDate: series.startDate.value.toISOString(),
      endDate: series.endDate.value.toISOString(),
      maxPlayers: 0, // TODO: Map from domain entity if needed
      buyInAmount: 0, // TODO: Map from domain entity if needed
      isActive: series.isActive,
      settings: {
        allowLateRegistration: false, // TODO: Map from domain entity
        lateRegistrationMinutes: 0,
        rebuyAllowed: false,
        rebuyCount: 0,
        addonAllowed: false,
      },
      tournamentCount: 0, // TODO: Get from tournament repository
      playerCount: 0, // TODO: Calculate from tournaments
      totalPrizePool: 0, // TODO: Calculate from tournaments
      createdAt: series.createdAt.value.toISOString(),
      updatedAt: series.updatedAt.value.toISOString(),
      createdBy: 'system', // TODO: Get from auth context
    };
  }
}
