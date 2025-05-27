import { LeagueRepository } from '@/src/core/domain/repositories/league.repository';
import { LeagueEntity } from '@/src/core/domain/entities/league.entity';

export interface GetLeaguesUseCase {
  execute(request: GetLeaguesRequest): Promise<GetLeaguesResult>;
}

export interface GetLeaguesRequest {
  userId?: string;
  activeOnly?: boolean;
  searchQuery?: string;
}

export interface GetLeaguesResult {
  success: boolean;
  data?: LeagueEntity[];
  error?: string;
}

export class GetLeaguesUseCaseImpl implements GetLeaguesUseCase {
  constructor(private readonly leagueRepository: LeagueRepository) {}

  async execute(request: GetLeaguesRequest): Promise<GetLeaguesResult> {
    try {
      let leagues: LeagueEntity[];

      if (request.userId) {
        leagues = await this.leagueRepository.findByUserId(request.userId);
      } else if (request.activeOnly) {
        leagues = await this.leagueRepository.findActiveLeagues();
      } else {
        leagues = await this.leagueRepository.findAll();
      }

      // Apply search filter if provided
      if (request.searchQuery) {
        const query = request.searchQuery.toLowerCase();
        leagues = leagues.filter(league => 
          league.name.toLowerCase().includes(query) ||
          (league.description && league.description.toLowerCase().includes(query))
        );
      }

      return {
        success: true,
        data: leagues
      };
    } catch (error) {
      console.error('Error fetching leagues:', error);
      return {
        success: false,
        error: 'Failed to fetch leagues'
      };
    }
  }
}
