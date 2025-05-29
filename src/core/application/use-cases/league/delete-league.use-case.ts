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
      // Validate input
      if (!request.id) {
        return { success: false, error: "League ID is required" };
      }

      if (!request.userId) {
        return { success: false, error: "User ID is required" };
      }

      // Get the league first to verify it exists and check ownership
      const league = await this.leagueRepository.findById(request.id);

      if (!league) {
        return { success: false, error: "League not found" };
      }

      // Check if user is the owner of the league
      if (!league.isOwnedBy(request.userId)) {
        return { success: false, error: "You don't have permission to delete this league" };
      }

      // Check if league is active - might want to deactivate instead of delete
      if (league.isActive) {
        return {
          success: false,
          error: "Cannot delete an active league. Please deactivate it first.",
        };
      }

      // TODO: In a real implementation, you would check for related entities
      // through separate repository calls or a dedicated service
      // For now, we'll proceed with the deletion

      // Delete the league
      await this.leagueRepository.delete(request.id);

      return { success: true };
    } catch (error) {
      console.error(`Error deleting league:`, error);
      return { success: false, error: "Failed to delete league" };
    }
  }
}
