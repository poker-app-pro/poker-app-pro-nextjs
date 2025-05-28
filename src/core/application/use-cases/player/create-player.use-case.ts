import { Player } from '../../../domain/entities/player';
import { IPlayerRepository } from '../../../domain/repositories/player.repository';
import { CreatePlayerDto, PlayerResponseDto } from '../../dtos/player.dto';

/**
 * Create Player Use Case
 * Handles the business logic for creating a new player
 */
export class CreatePlayerUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(dto: CreatePlayerDto): Promise<PlayerResponseDto> {
    // Validate input
    if (!dto.name?.trim()) {
      throw new Error('Player name is required');
    }

    // Create player entity
    const player = Player.create(
      this.generatePlayerId(),
      dto.name,
      {
        email: dto.email,
        phone: dto.phone,
        profileImageUrl: dto.profileImageUrl,
        notes: dto.notes,
      }
    );

    // Save to repository
    const savedPlayer = await this.playerRepository.save(player);

    // Return DTO
    return this.toResponseDto(savedPlayer);
  }

  private generatePlayerId(): string {
    // In a real implementation, this would use a proper ID generator
    // For now, using timestamp + random for uniqueness
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
