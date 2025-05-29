import { League } from '@/src/core/domain/entities/league';
import { ILeagueRepository } from '@/src/core/domain/repositories/league.repository';

export interface UpdateLeagueRequest {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  userId: string;
}

export interface UpdateLeagueResponse {
  success: boolean;
  data?: League;
  error?: string;
}

export class UpdateLeagueUseCase {
  constructor(private leagueRepository: ILeagueRepository) {}

  async execute(request: UpdateLeagueRequest): Promise<UpdateLeagueResponse> {
    try {
      // Validate required fields
      if (!request.name.trim()) {
        return { success: false, error: "League name is required" };
      }

      if (!request.userId) {
        return { success: false, error: "User ID is required" };
      }

      // Get existing league
      const existingLeague = await this.leagueRepository.findById(request.id);
      if (!existingLeague) {
        return { success: false, error: "League not found" };
      }

      // Check if user is the owner of the league
      if (!existingLeague.isOwnedBy(request.userId)) {
        return { success: false, error: "You don't have permission to update this league" };
      }

      // Update the league using entity methods
      existingLeague.updateName(request.name);
      existingLeague.updateDescription(request.description);
      
      if (request.isActive && !existingLeague.isActive) {
        existingLeague.activate();
      } else if (!request.isActive && existingLeague.isActive) {
        existingLeague.deactivate();
      }

      const savedLeague = await this.leagueRepository.update(existingLeague);

      return { success: true, data: savedLeague };
    } catch (error) {
      console.error("Error updating league:", error);
      return { success: false, error: "Failed to update league" };
    }
  }
}
