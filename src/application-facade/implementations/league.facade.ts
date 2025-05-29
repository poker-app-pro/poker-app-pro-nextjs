import { ILeagueFacade } from '../interfaces/ILeagueFacade';
import { 
  CreateLeagueDTO, 
  UpdateLeagueDTO, 
  LeagueDTO, 
  LeagueListDTO,
  LeagueSearchDTO
} from '../../core/application/dtos/league.dto';
import { ILeagueRepository } from '../../core/domain/repositories/league.repository';
import { IAuthService } from '../../infrastructure/services/amplify-auth.service';
import { League } from '../../core/domain/entities/league';

/**
 * League Facade Implementation
 * Orchestrates league operations by coordinating between domain services,
 * repositories, and application logic while remaining framework-agnostic
 */
export class LeagueFacade implements ILeagueFacade {
  constructor(
    private readonly leagueRepository: ILeagueRepository,
    private readonly authService: IAuthService
  ) {}

  async createLeague(data: CreateLeagueDTO): Promise<{ success: boolean; data?: LeagueDTO; error?: string }> {
    try {
      // Validate user permissions
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId) {
        return { success: false, error: 'User not authenticated' };
      }

      // Create domain entity
      const league = League.create(
        crypto.randomUUID(),
        data.name,
        data.ownerId,
        {
          description: data.description,
          isActive: data.isActive ?? true,
        }
      );

      // Save to repository
      const savedLeague = await this.leagueRepository.create(league);

      // Convert to response DTO
      const responseDTO = this.toLeagueDTO(savedLeague);

      return { success: true, data: responseDTO };
    } catch (error) {
      console.error('Error creating league:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create league' 
      };
    }
  }

  async updateLeague(data: UpdateLeagueDTO): Promise<{ success: boolean; data?: LeagueDTO; error?: string }> {
    try {
      // Validate user permissions
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get existing league
      const existingLeague = await this.leagueRepository.findById(data.id);
      if (!existingLeague) {
        return { success: false, error: 'League not found' };
      }

      // Check if user has permission to update this league
      if (existingLeague.ownerId !== currentUserId) {
        const hasAdminRole = await this.authService.hasRole('ADMIN');
        if (!hasAdminRole) {
          return { success: false, error: 'Unauthorized to update this league' };
        }
      }

      // Update league properties
      if (data.name !== undefined) {
        existingLeague.updateName(data.name);
      }
      if (data.description !== undefined) {
        existingLeague.updateDescription(data.description);
      }
      if (data.isActive !== undefined) {
        if (data.isActive) {
          existingLeague.activate();
        } else {
          existingLeague.deactivate();
        }
      }

      // Save updated league
      const updatedLeague = await this.leagueRepository.update(existingLeague);

      // Convert to response DTO
      const responseDTO = this.toLeagueDTO(updatedLeague);

      return { success: true, data: responseDTO };
    } catch (error) {
      console.error('Error updating league:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update league' 
      };
    }
  }

  async deleteLeague(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate user permissions
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId || currentUserId !== userId) {
        return { success: false, error: 'Unauthorized to delete league' };
      }

      // Get existing league
      const league = await this.leagueRepository.findById(id);
      if (!league) {
        return { success: false, error: 'League not found' };
      }

      // Check if user has permission to delete this league
      if (league.ownerId !== currentUserId) {
        const hasAdminRole = await this.authService.hasRole('ADMIN');
        if (!hasAdminRole) {
          return { success: false, error: 'Unauthorized to delete this league' };
        }
      }

      // Delete league
      await this.leagueRepository.delete(id);

      return { success: true };
    } catch (error) {
      console.error('Error deleting league:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete league' 
      };
    }
  }

  async getLeague(id: string): Promise<{ success: boolean; data?: LeagueDTO; error?: string }> {
    try {
      const league = await this.leagueRepository.findById(id);
      
      if (!league) {
        return { success: false, error: 'League not found' };
      }

      const responseDTO = this.toLeagueDTO(league);
      return { success: true, data: responseDTO };
    } catch (error) {
      console.error('Error getting league:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get league' 
      };
    }
  }

  async getLeagues(search?: LeagueSearchDTO): Promise<{ success: boolean; data?: LeagueListDTO; error?: string }> {
    try {
      let leaguesList: League[];

      if (search?.searchTerm) {
        leaguesList = await this.leagueRepository.findByName(search.searchTerm);
      } else {
        leaguesList = await this.leagueRepository.findAll();
      }

      // Apply additional filters if provided
      if (search?.ownerId) {
        leaguesList = leaguesList.filter(l => l.ownerId === search.ownerId);
      }
      if (search?.isActive !== undefined) {
        leaguesList = leaguesList.filter(l => l.isActive === search.isActive);
      }

      // Apply pagination
      const page = search?.page || 1;
      const pageSize = search?.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedLeagues = leaguesList.slice(startIndex, endIndex);

      // Convert to DTOs
      const leagueDTOs = paginatedLeagues.map(league => this.toLeagueDTO(league));

      const listDTO: LeagueListDTO = {
        leagues: leagueDTOs,
        totalCount: leaguesList.length,
      };

      return { success: true, data: listDTO };
    } catch (error) {
      console.error('Error getting leagues:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get leagues' 
      };
    }
  }

  async getLeaguesByOwner(ownerId: string): Promise<{ success: boolean; data?: LeagueDTO[]; error?: string }> {
    try {
      const leaguesList = await this.leagueRepository.findByOwnerId(ownerId);
      const responseDTOs = leaguesList.map(league => this.toLeagueDTO(league));
      return { success: true, data: responseDTOs };
    } catch (error) {
      console.error('Error getting leagues by owner:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get leagues by owner' 
      };
    }
  }

  async getActiveLeagues(): Promise<{ success: boolean; data?: LeagueDTO[]; error?: string }> {
    try {
      const leaguesList = await this.leagueRepository.findActive();
      const responseDTOs = leaguesList.map(league => this.toLeagueDTO(league));
      return { success: true, data: responseDTOs };
    } catch (error) {
      console.error('Error getting active leagues:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get active leagues' 
      };
    }
  }

  async toggleLeagueStatus(id: string, isActive: boolean, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate user permissions
      const currentUserId = await this.authService.getCurrentUserId();
      if (!currentUserId || currentUserId !== userId) {
        return { success: false, error: 'Unauthorized to modify league' };
      }

      // Get existing league
      const league = await this.leagueRepository.findById(id);
      if (!league) {
        return { success: false, error: 'League not found' };
      }

      // Check if user has permission to modify this league
      if (league.ownerId !== currentUserId) {
        const hasAdminRole = await this.authService.hasRole('ADMIN');
        if (!hasAdminRole) {
          return { success: false, error: 'Unauthorized to modify this league' };
        }
      }

      // Toggle status
      if (isActive) {
        league.activate();
      } else {
        league.deactivate();
      }

      // Save updated league
      await this.leagueRepository.update(league);

      return { success: true };
    } catch (error) {
      console.error('Error toggling league status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to toggle league status' 
      };
    }
  }

  async leagueExists(id: string): Promise<{ success: boolean; exists?: boolean; error?: string }> {
    try {
      const exists = await this.leagueRepository.exists(id);
      return { success: true, exists };
    } catch (error) {
      console.error('Error checking if league exists:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check league existence' 
      };
    }
  }

  private toLeagueDTO(league: League): LeagueDTO {
    return {
      id: league.id,
      name: league.name,
      description: league.description,
      ownerId: league.ownerId,
      isActive: league.isActive,
      createdAt: league.createdAt.value.toISOString(),
      updatedAt: league.updatedAt.value.toISOString(),
    };
  }
}
