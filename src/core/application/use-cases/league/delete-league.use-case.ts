import { ILeagueRepository } from '@/src/core/domain/repositories/league.repository';

export interface DeleteLeagueRequest {
  id: string;
  userId: string;
}

export interface DeleteLeagueResponse {
  success: boolean;
  error?: string;
}

export class DeleteLeagueUseCase {
  constructor(private leagueRepository: ILeagueRepository) {}

  async execute(request: DeleteLeagueRequest): Promise<DeleteLeagueResponse> {
    try {
      // Get the league first to check relationships
      const league = await this.leagueRepository.findById(request.id);

      if (!league) {
        return { success: false, error: "League not found" };
      }

      // Check if league has seasons
      if (league.seasons && league.seasons.length > 0) {
        return {
          success: false,
          error: "Cannot delete league with existing seasons. Please delete all seasons first.",
        };
      }

      // Check if league has series
      if (league.series && league.series.length > 0) {
        return {
          success: false,
          error: "Cannot delete league with existing series. Please delete all series first.",
        };
      }

      // Check if league has tournaments
      if (league.tournaments && league.tournaments.length > 0) {
        return {
          success: false,
          error: "Cannot delete league with existing tournaments. Please delete all tournaments first.",
        };
      }

      // Delete the league
      await this.leagueRepository.delete(request.id);

      return { success: true };
    } catch (error) {
      console.error(`Error deleting league:`, error);
      return { success: false, error: "Failed to delete league" };
    }
  }
}
