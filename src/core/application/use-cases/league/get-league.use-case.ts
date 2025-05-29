import { League } from '@/src/core/domain/entities/league';
import { ILeagueRepository } from '@/src/core/domain/repositories/league.repository';

export interface GetLeagueRequest {
  id: string;
}

export interface GetLeagueResponse {
  success: boolean;
  data?: League;
  error?: string;
}

export class GetLeagueUseCase {
  constructor(private leagueRepository: ILeagueRepository) {}

  async execute(request: GetLeagueRequest): Promise<GetLeagueResponse> {
    try {
      const league = await this.leagueRepository.findById(request.id);
      
      if (!league) {
        return { success: false, error: "League not found" };
      }

      return { success: true, data: league };
    } catch (error) {
      console.error(`Error fetching league ${request.id}:`, error);
      return { success: false, error: "Failed to fetch league" };
    }
  }
}
