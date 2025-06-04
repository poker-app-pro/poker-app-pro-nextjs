import { ILeagueFacade } from '../interfaces/ILeagueFacade';
import { 
  CreateLeagueDTO, 
  UpdateLeagueDTO, 
  LeagueDTO, 
  LeagueListDTO, 
  LeagueSearchDTO 
} from '@/src/core/application/dtos/league.dto';
import { cookieBasedClient } from '@/lib/amplify-utils';

/**
 * League Facade Implementation
 * Implements the ILeagueFacade interface using Amplify DataStore
 */
export class LeagueFacade implements ILeagueFacade {
  /**
   * Create a new league
   */
  async createLeague(data: CreateLeagueDTO): Promise<{ success: boolean; data?: LeagueDTO; error?: string }> {
    try {
      const result = await cookieBasedClient.models.League.create(
        {
          name: data.name,
          description: data.description,
          userId: data.ownerId, // Map ownerId to userId in the database
          isActive: data.isActive,
        },
        {
          authMode: 'userPool',
        }
      );

      if (!result.data) {
        return { success: false, error: 'Failed to create league' };
      }

      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description || '',
          ownerId: result.data.userId, // Map userId to ownerId in the DTO
          isActive: result.data.isActive || false,
          createdAt: result.data.createdAt || new Date().toISOString(),
          updatedAt: result.data.updatedAt || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error creating league:', error);
      return { success: false, error: 'Failed to create league' };
    }
  }

  /**
   * Update an existing league
   */
  async updateLeague(data: UpdateLeagueDTO): Promise<{ success: boolean; data?: LeagueDTO; error?: string }> {
    try {
      // First check if the league exists
      const existingLeague = await cookieBasedClient.models.League.get(
        { id: data.id },
        { authMode: 'userPool' }
      );

      if (!existingLeague.data) {
        return { success: false, error: 'League not found' };
      }

      // Update the league
      const result = await cookieBasedClient.models.League.update(
        {
          id: data.id,
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        },
        {
          authMode: 'userPool',
        }
      );

      if (!result.data) {
        return { success: false, error: 'Failed to update league' };
      }

      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description || '',
          ownerId: result.data.userId, // Map userId to ownerId in the DTO
          isActive: result.data.isActive || false,
          createdAt: result.data.createdAt || new Date().toISOString(),
          updatedAt: result.data.updatedAt || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error updating league:', error);
      return { success: false, error: 'Failed to update league' };
    }
  }

  /**
   * Delete a league
   */
  async deleteLeague(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if the league exists
      const existingLeague = await cookieBasedClient.models.League.get(
        { id },
        { authMode: 'userPool' }
      );

      if (!existingLeague.data) {
        return { success: false, error: 'League not found' };
      }

      // Check if the user is the owner of the league
      if (existingLeague.data.userId !== userId) {
        return { success: false, error: 'You are not authorized to delete this league' };
      }

      // Delete the league
      await cookieBasedClient.models.League.delete(
        { id },
        { authMode: 'userPool' }
      );

      // Log the activity
      await cookieBasedClient.models.ActivityLog.create(
        {
          userId,
          action: 'DELETE',
          entityType: 'League',
          entityId: id,
          details: { name: existingLeague.data.name },
          timestamp: new Date().toISOString(),
        },
        {
          authMode: 'userPool',
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error deleting league:', error);
      return { success: false, error: 'Failed to delete league' };
    }
  }

  /**
   * Get a league by ID
   */
  async getLeague(id: string): Promise<{ success: boolean; data?: LeagueDTO; error?: string }> {
    try {
      const result = await cookieBasedClient.models.League.get(
        { id },
        { authMode: 'userPool' }
      );

      if (!result.data) {
        return { success: false, error: 'League not found' };
      }

      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description || '',
          ownerId: result.data.userId, // Map userId to ownerId in the DTO
          isActive: result.data.isActive || false,
          createdAt: result.data.createdAt || new Date().toISOString(),
          updatedAt: result.data.updatedAt || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error getting league:', error);
      return { success: false, error: 'Failed to get league' };
    }
  }

  /**
   * Get all leagues
   */
  async getAllLeagues(search?: LeagueSearchDTO): Promise<{ success: boolean; data?: LeagueListDTO; error?: string }> {
    try {
      // Build filter based on search parameters
      let filter: any = {};
      
      if (search) {
        const conditions = [];
        
        if (search.searchTerm) {
          conditions.push({
            name: { contains: search.searchTerm },
          });
        }
        
        if (search.ownerId) {
          conditions.push({
            userId: { eq: search.ownerId }, // Map ownerId to userId in the filter
          });
        }
        
        if (search.isActive !== undefined) {
          conditions.push({
            isActive: { eq: search.isActive },
          });
        }
        
        if (conditions.length > 0) {
          filter = { and: conditions };
        }
      }

      // Get all leagues
      const result = await cookieBasedClient.models.League.list(
        filter ? { filter } : undefined,
        { authMode: 'userPool' }
      );

      if (!result.data) {
        return { success: false, error: 'Failed to get leagues' };
      }

      // Map to DTOs
      const leagues = result.data.map(league => ({
        id: league.id,
        name: league.name,
        description: league.description || '',
        ownerId: league.userId, // Map userId to ownerId in the DTO
        isActive: league.isActive || false,
        createdAt: league.createdAt || new Date().toISOString(),
        updatedAt: league.updatedAt || new Date().toISOString(),
      }));

      // Apply pagination if requested
      const page = search?.page || 1;
      const pageSize = search?.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const paginatedLeagues = leagues.slice(startIndex, startIndex + pageSize);

      return {
        success: true,
        data: {
          leagues: paginatedLeagues,
          totalCount: leagues.length, // Use totalCount instead of total
        },
      };
    } catch (error) {
      console.error('Error getting leagues:', error);
      return { success: false, error: 'Failed to get leagues' };
    }
  }

  /**
   * Get leagues by user
   */
  async getLeaguesByUser(userId: string): Promise<{ success: boolean; data?: LeagueDTO[]; error?: string }> {
    try {
      // Get leagues where the user is the owner
      const result = await cookieBasedClient.models.League.list(
        {
          filter: {
            userId: { eq: userId },
          },
        },
        { authMode: 'userPool' }
      );

      if (!result.data) {
        return { success: false, error: 'Failed to get leagues' };
      }

      // Map to DTOs
      const leagues = result.data.map(league => ({
        id: league.id,
        name: league.name,
        description: league.description || '',
        ownerId: league.userId, // Map userId to ownerId in the DTO
        isActive: league.isActive || false,
        createdAt: league.createdAt || new Date().toISOString(),
        updatedAt: league.updatedAt || new Date().toISOString(),
      }));

      return {
        success: true,
        data: leagues,
      };
    } catch (error) {
      console.error('Error getting leagues by user:', error);
      return { success: false, error: 'Failed to get leagues by user' };
    }
  }

  /**
   * Check if league exists
   */
  async leagueExists(id: string): Promise<{ success: boolean; exists?: boolean; error?: string }> {
    try {
      const result = await cookieBasedClient.models.League.get(
        { id },
        { authMode: 'userPool' }
      );

      return {
        success: true,
        exists: !!result.data,
      };
    } catch (error) {
      console.error('Error checking if league exists:', error);
      return { success: false, error: 'Failed to check if league exists' };
    }
  }

  /**
   * Add user to league
   */
  async addUserToLeague(leagueId: string, userId: string, role: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if the league exists
      const leagueResult = await cookieBasedClient.models.League.get(
        { id: leagueId },
        { authMode: 'userPool' }
      );

      if (!leagueResult.data) {
        return { success: false, error: 'League not found' };
      }

      // Check if the user is already a member of the league
      const leagueUserResult = await cookieBasedClient.models.LeagueUser.list(
        {
          filter: {
            and: [
              { leagueId: { eq: leagueId } },
              { userId: { eq: userId } },
            ],
          },
        },
        { authMode: 'userPool' }
      );

      if (leagueUserResult.data && leagueUserResult.data.length > 0) {
        // User is already a member, update their role
        await cookieBasedClient.models.LeagueUser.update(
          {
            id: leagueUserResult.data[0].id,
            role,
          },
          { authMode: 'userPool' }
        );
      } else {
        // Add the user to the league
        await cookieBasedClient.models.LeagueUser.create(
          {
            leagueId,
            userId,
            role,
            joinDate: new Date().toISOString(),
          },
          { authMode: 'userPool' }
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding user to league:', error);
      return { success: false, error: 'Failed to add user to league' };
    }
  }

  /**
   * Remove user from league
   */
  async removeUserFromLeague(leagueId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if the league exists
      const leagueResult = await cookieBasedClient.models.League.get(
        { id: leagueId },
        { authMode: 'userPool' }
      );

      if (!leagueResult.data) {
        return { success: false, error: 'League not found' };
      }

      // Check if the user is a member of the league
      const leagueUserResult = await cookieBasedClient.models.LeagueUser.list(
        {
          filter: {
            and: [
              { leagueId: { eq: leagueId } },
              { userId: { eq: userId } },
            ],
          },
        },
        { authMode: 'userPool' }
      );

      if (!leagueUserResult.data || leagueUserResult.data.length === 0) {
        return { success: false, error: 'User is not a member of this league' };
      }

      // Remove the user from the league
      await cookieBasedClient.models.LeagueUser.delete(
        { id: leagueUserResult.data[0].id },
        { authMode: 'userPool' }
      );

      return { success: true };
    } catch (error) {
      console.error('Error removing user from league:', error);
      return { success: false, error: 'Failed to remove user from league' };
    }
  }

  /**
   * Get league users
   */
  async getLeagueUsers(leagueId: string): Promise<{ success: boolean; data?: { userId: string; role: string }[]; error?: string }> {
    try {
      // First check if the league exists
      const leagueResult = await cookieBasedClient.models.League.get(
        { id: leagueId },
        { authMode: 'userPool' }
      );

      if (!leagueResult.data) {
        return { success: false, error: 'League not found' };
      }

      // Get all users for this league
      const leagueUserResult = await cookieBasedClient.models.LeagueUser.list(
        {
          filter: {
            leagueId: { eq: leagueId },
          },
        },
        { authMode: 'userPool' }
      );

      if (!leagueUserResult.data) {
        return { success: false, error: 'Failed to get league users' };
      }

      // Map to DTOs
      const leagueUsers = leagueUserResult.data.map(leagueUser => ({
        userId: leagueUser.userId,
        role: leagueUser.role,
      }));

      return {
        success: true,
        data: leagueUsers,
      };
    } catch (error) {
      console.error('Error getting league users:', error);
      return { success: false, error: 'Failed to get league users' };
    }
  }
}
