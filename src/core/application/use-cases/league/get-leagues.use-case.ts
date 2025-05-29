import { League } from '@/src/core/domain/entities/league';
import { ILeagueRepository } from '@/src/core/domain/repositories/league.repository';

export interface GetLeaguesRequest {
  activeOnly?: boolean;
}

export interface GetLeaguesResponse {
  success: boolean;
  data?: League[];
  error?: string;
}

export class GetLeaguesUseCase {
  constructor(private leagueRepository: ILeagueRepository) {}

  async execute(request: GetLeaguesRequest = {}): Promise<GetLeaguesResponse> {
    try {
      const leagues = await this.leagueRepository.findAll(request.activeOnly);
      return { success: true, data: leagues };
    } catch (error) {
      console.error("Error fetching leagues:", error);
      return { success: false, error: "Failed to fetch leagues" };
    }
  }
}
