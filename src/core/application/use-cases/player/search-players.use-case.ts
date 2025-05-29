import { Player } from '@/src/core/domain/entities/player';
import { IPlayerRepository, PlayerSearchCriteria } from '@/src/core/domain/repositories/player.repository';
import { PlayerSearchDto, PlayerListDto, PlayerResponseDto } from '@/src/core/application/dtos/player.dto';

/**
 * Search Players Use Case
 * Handles the business logic for searching and listing players
 */
export class SearchPlayersUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(dto: PlayerSearchDto): Promise<PlayerListDto> {
    // Convert DTO to domain criteria
    const criteria: PlayerSearchCriteria = {
      query: dto.query,
      isActive: dto.isActive,
      joinedAfter: dto.joinedAfter ? new Date(dto.joinedAfter) : undefined,
      joinedBefore: dto.joinedBefore ? new Date(dto.joinedBefore) : undefined,
      page: dto.page ?? 1,
      pageSize: Math.min(dto.pageSize ?? 20, 100), // Limit max page size
      sortBy: dto.sortBy ?? 'name',
      sortOrder: dto.sortOrder ?? 'asc',
    };

    // Validate pagination
    if (criteria.page! < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (criteria.pageSize! < 1) {
      throw new Error('Page size must be greater than 0');
    }

    // Validate date range
    if (criteria.joinedAfter && criteria.joinedBefore && criteria.joinedAfter > criteria.joinedBefore) {
      throw new Error('joinedAfter cannot be later than joinedBefore');
    }

    // Search players
    const searchResult = await this.playerRepository.findMany(criteria);

    // Convert to response DTOs
    const playerDtos = searchResult.players.map(player => this.toResponseDto(player));

    return {
      players: playerDtos,
      total: searchResult.total,
      page: searchResult.page,
      pageSize: searchResult.pageSize,
    };
  }

  private toResponseDto(player: Player): PlayerResponseDto {
    return {
      id: player.id,
      name: player.name,
      email: player.email,
      phone: player.phone,
      profileImageUrl: player.profileImageUrl,
      notes: player.notes,
      isActive: player.isActive,
      joinDate: player.joinDate.toISOString(),
    };
  }
}
