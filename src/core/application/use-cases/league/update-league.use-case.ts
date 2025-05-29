import { League } from '@/src/core/domain/entities/league';
import { ILeagueRepository } from '@/src/core/domain/repositories/league.repository';

export interface UpdateLeagueRequest {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  imageUrl?: string;
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

      // Get existing league
      const existingLeague = await this.leagueRepository.findById(request.id);
      if (!existingLeague) {
        return { success: false, error: "League not found" };
      }

      // Update the league
      const updatedLeague = new League(
        request.id,
        request.name,
        request.description || '',
        request.isActive,
        request.imageUrl || '',
        request.userId,
        existingLeague.seasons,
        existingLeague.series,
        existingLeague.tournaments,
        existingLeague.scoreboards,
        existingLeague.qualifications,
        existingLeague.leagueSettings
      );

      const savedLeague = await this.leagueRepository.update(updatedLeague);

      return { success: true, data: savedLeague };
    } catch (error) {
      console.error("Error updating league:", error);
      return { success: false, error: "Failed to update league" };
    }
  }
}
