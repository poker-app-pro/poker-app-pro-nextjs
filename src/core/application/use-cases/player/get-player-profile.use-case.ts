import { IPlayerRepository, PlayerProfile } from '@/src/core/domain/repositories/player.repository';

export interface GetPlayerProfileRequest {
  playerId: string;
}

export interface GetPlayerProfileResponse {
  success: boolean;
  data?: PlayerProfile;
  error?: string;
}

export class GetPlayerProfileUseCase {
  constructor(private playerRepository: IPlayerRepository) {}

  async execute(request: GetPlayerProfileRequest): Promise<GetPlayerProfileResponse> {
    try {
      const playerProfile = await this.playerRepository.getPlayerProfile(request.playerId);
      
      if (!playerProfile) {
        return { success: false, error: "Player not found" };
      }

      return { success: true, data: playerProfile };
    } catch (error) {
      console.error("Error fetching player profile:", error);
      return { success: false, error: "Failed to fetch player profile" };
    }
  }
}
