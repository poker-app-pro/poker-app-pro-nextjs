import { Player } from '../../../domain/entities/player';
import { IPlayerRepository } from '../../../domain/repositories/player.repository';
import { UpdatePlayerDto, PlayerResponseDto } from '../../dtos/player.dto';

/**
 * Update Player Use Case
 * Handles the business logic for updating an existing player
 */
export class UpdatePlayerUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(dto: UpdatePlayerDto): Promise<PlayerResponseDto> {
    // Find existing player
    const existingPlayer = await this.playerRepository.findById(dto.id);
    if (!existingPlayer) {
      throw new Error(`Player with ID ${dto.id} not found`);
    }

    // Update player properties
    if (dto.name !== undefined) {
      existingPlayer.updateName(dto.name);
    }

    if (dto.email !== undefined) {
      existingPlayer.updateEmail(dto.email);
    }

    if (dto.phone !== undefined) {
      existingPlayer.updatePhone(dto.phone);
    }

    if (dto.profileImageUrl !== undefined) {
      existingPlayer.updateProfileImage(dto.profileImageUrl);
    }

    if (dto.notes !== undefined) {
      existingPlayer.updateNotes(dto.notes);
    }

    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        existingPlayer.activate();
      } else {
        existingPlayer.deactivate();
      }
    }

    // Save updated player
    const savedPlayer = await this.playerRepository.save(existingPlayer);

    // Return DTO
    return this.toResponseDto(savedPlayer);
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
