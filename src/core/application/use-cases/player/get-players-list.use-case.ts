import { IPlayerRepository, PlayerListItem } from '@/src/core/domain/repositories/player.repository';

export interface GetPlayersListRequest {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export interface GetPlayersListResponse {
  success: boolean;
  data?: {
    players: PlayerListItem[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  };
  error?: string;
}

export class GetPlayersListUseCase {
  constructor(private playerRepository: IPlayerRepository) {}

  async execute(request: GetPlayersListRequest = {}): Promise<GetPlayersListResponse> {
    try {
      const { searchTerm = '', page = 1, pageSize = 10 } = request;
      
      const result = await this.playerRepository.getPlayersList(searchTerm, page, pageSize);
      
      return { success: true, data: result };
    } catch (error) {
      console.error("Error fetching players:", error);
      return { success: false, error: "Failed to fetch players" };
    }
  }
}
