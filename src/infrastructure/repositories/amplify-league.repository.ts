import { LeagueRepository } from '../../core/domain/repositories/league.repository';
import { LeagueEntity, CreateLeagueRequest, UpdateLeagueRequest } from '../../core/domain/entities/league.entity';
import { 
  AmplifyDataClient, 
  AmplifyLeagueData 
} from '../types/amplify.types';

export class AmplifyLeagueRepository implements LeagueRepository {
  constructor(private readonly client: AmplifyDataClient) {}

  async findById(id: string): Promise<LeagueEntity | null> {
    try {
      const result = await this.client.models.League.get(
        { id },
        { authMode: "userPool" }
      );
      
      if (!result.data) {
        return null;
      }

      return this.mapToEntity(result.data);
    } catch (error) {
      console.error(`Error finding league by id ${id}:`, error);
      throw new Error('Failed to find league');
    }
  }

  async findByUserId(userId: string): Promise<LeagueEntity[]> {
    try {
      const result = await this.client.models.League.list({
        filter: { userId: { eq: userId } },
        authMode: "userPool"
      });

      return result.data.map(item => this.mapToEntity(item));
    } catch (error) {
      console.error(`Error finding leagues by userId ${userId}:`, error);
      throw new Error('Failed to find leagues by user');
    }
  }

  async findActiveLeagues(): Promise<LeagueEntity[]> {
    try {
      const result = await this.client.models.League.list({
        filter: { isActive: { eq: true } },
        authMode: "userPool"
      });

      return result.data.map(item => this.mapToEntity(item));
    } catch (error) {
      console.error('Error finding active leagues:', error);
      throw new Error('Failed to find active leagues');
    }
  }

  async findAll(): Promise<LeagueEntity[]> {
    try {
      const result = await this.client.models.League.list({
        authMode: "userPool"
      });

      return result.data.map(item => this.mapToEntity(item));
    } catch (error) {
      console.error('Error finding all leagues:', error);
      throw new Error('Failed to find leagues');
    }
  }

  async create(request: CreateLeagueRequest): Promise<LeagueEntity> {
    try {
      const result = await this.client.models.League.create(
        {
          name: request.name,
          description: request.description,
          isActive: request.isActive ?? true,
          imageUrl: request.imageUrl,
          userId: request.userId,
          seasons: [],
          series: [],
          tournaments: [],
          scoreboards: [],
          qualifications: [],
          leagueSettings: []
        },
        { authMode: "userPool" }
      );

      if (!result.data) {
        throw new Error('Failed to create league - no data returned');
      }

      // Create default league settings
      if (result.data.id) {
        await this.client.models.LeagueSettings.create(
          {
            leagueId: result.data.id,
            defaultPointsSystem: "standard",
            defaultGameType: "Texas Hold'em",
            defaultBuyIn: 0,
            defaultStartingChips: 1000,
            defaultBlindStructure: "15 minutes"
          },
          { authMode: "userPool" }
        );
      }

      return this.mapToEntity(result.data);
    } catch (error) {
      console.error('Error creating league:', error);
      throw new Error('Failed to create league');
    }
  }

  async update(request: UpdateLeagueRequest): Promise<LeagueEntity> {
    try {
      const result = await this.client.models.League.update(
        {
          id: request.id,
          name: request.name,
          description: request.description,
          isActive: request.isActive,
          imageUrl: request.imageUrl
        },
        { authMode: "userPool" }
      );

      if (!result.data) {
        throw new Error('Failed to update league - no data returned');
      }

      return this.mapToEntity(result.data);
    } catch (error) {
      console.error(`Error updating league ${request.id}:`, error);
      throw new Error('Failed to update league');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.client.models.League.delete(
        { id },
        { authMode: "userPool" }
      );
    } catch (error) {
      console.error(`Error deleting league ${id}:`, error);
      throw new Error('Failed to delete league');
    }
  }

  async existsById(id: string): Promise<boolean> {
    try {
      const league = await this.findById(id);
      return league !== null;
    } catch {
      return false;
    }
  }

  async findByName(name: string, userId: string): Promise<LeagueEntity | null> {
    try {
      const result = await this.client.models.League.list({
        filter: { 
          and: [
            { name: { eq: name } },
            { userId: { eq: userId } }
          ]
        },
        authMode: "userPool"
      });

      if (result.data.length === 0) {
        return null;
      }

      return this.mapToEntity(result.data[0]);
    } catch (error) {
      console.error(`Error finding league by name ${name}:`, error);
      throw new Error('Failed to find league by name');
    }
  }

  private mapToEntity(data: AmplifyLeagueData): LeagueEntity {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
      imageUrl: data.imageUrl,
      userId: data.userId,
      seasons: data.seasons || [],
      series: data.series || [],
      tournaments: data.tournaments || [],
      scoreboards: data.scoreboards || [],
      qualifications: data.qualifications || [],
      leagueSettings: data.leagueSettings || [],
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined
    };
  }
}
