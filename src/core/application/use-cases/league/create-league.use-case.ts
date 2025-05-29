import { League } from '@/src/core/domain/entities/league';
import { ILeagueRepository } from '@/src/core/domain/repositories/league.repository';

export interface CreateLeagueRequest {
  name: string;
  description?: string;
  isActive: boolean;
  userId: string;
}

export interface CreateLeagueResponse {
  success: boolean;
  data?: League;
  error?: string;
}

export class CreateLeagueUseCase {
  constructor(private leagueRepository: ILeagueRepository) { }

  async execute(request: CreateLeagueRequest): Promise<CreateLeagueResponse> {
    try {
      // Validate required fields
      if (!request.name.trim()) {
        return { success: false, error: "League name is required" };
      }

      if (!request.userId) {
        return { success: false, error: "User ID is required" };
      }

      // Generate a temporary ID for the league entity
      // In a real implementation, this could be a UUID or the repository could handle ID generation
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create the league entity using the static create method
      const league = League.create(
        tempId,
        request.name,
        request.userId,
        {
          description: request.description,
          isActive: request.isActive,
        }
      );

      // Save through repository
      const savedLeague = await this.leagueRepository.create(league);

      return { success: true, data: savedLeague };
    } catch (error) {
      console.error("Error creating league:", error);
      return { success: false, error: "Failed to create league" };
    }
  }
}
