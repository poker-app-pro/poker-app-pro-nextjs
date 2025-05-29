import { GameResult } from '@/src/core/domain/entities/game-result';
import { Position } from '@/src/core/domain/value-objects/position';
import { Points } from '@/src/core/domain/value-objects/points';
import { GameTime } from '@/src/core/domain/value-objects/game-time';
import { IGameResultRepository } from '@/src/core/domain/repositories/game-result.repository';
import { IPlayerRepository } from '@/src/core/domain/repositories/player.repository';
import { CreateGameResultDto, GameResultResponseDto } from '@/src/core/application/dtos/game-result.dto';

/**
 * Create Game Result Use Case
 * Handles the business logic for creating a new game result
 */
export class CreateGameResultUseCase {
  constructor(
    private readonly gameResultRepository: IGameResultRepository,
    private readonly playerRepository: IPlayerRepository
  ) {}

  async execute(dto: CreateGameResultDto): Promise<GameResultResponseDto> {
    // Validate input
    await this.validateInput(dto);

    // Get player entity
    const player = await this.playerRepository.findById(dto.playerId);
    if (!player) {
      throw new Error(`Player with ID ${dto.playerId} not found`);
    }

    // Create value objects
    const position = new Position(dto.position);
    const points = new Points(dto.points);
    const gameTime = dto.gameTime ? new GameTime(dto.gameTime) : GameTime.now();

    // Create game result entity
    const gameResult = GameResult.create(
      this.generateGameResultId(),
      dto.tournamentId,
      player,
      position,
      points,
      {
        gameTime,
        bountyCount: dto.bountyCount,
        isConsolation: dto.isConsolation,
        notes: dto.notes,
      }
    );

    // Check for duplicate results
    await this.checkForDuplicates(dto.tournamentId, dto.playerId, dto.position);

    // Save to repository
    const savedGameResult = await this.gameResultRepository.save(gameResult);

    // Return DTO
    return this.toResponseDto(savedGameResult);
  }

  private async validateInput(dto: CreateGameResultDto): Promise<void> {
    if (!dto.tournamentId?.trim()) {
      throw new Error('Tournament ID is required');
    }

    if (!dto.playerId?.trim()) {
      throw new Error('Player ID is required');
    }

    if (dto.position < 1) {
      throw new Error('Position must be greater than 0');
    }

    if (dto.points < 0) {
      throw new Error('Points cannot be negative');
    }

    if (dto.bountyCount !== undefined && dto.bountyCount < 0) {
      throw new Error('Bounty count cannot be negative');
    }

    if (dto.gameTime) {
      try {
        new Date(dto.gameTime);
      } catch {
        throw new Error('Invalid game time format');
      }
    }
  }

  private async checkForDuplicates(tournamentId: string, playerId: string, position: number): Promise<void> {
    // Check if player already has a result in this tournament
    const existingResults = await this.gameResultRepository.findByPlayerAndTournament(playerId, tournamentId);
    if (existingResults.length > 0) {
      throw new Error('Player already has a result in this tournament');
    }

    // Check if position is already taken in this tournament
    const tournamentResults = await this.gameResultRepository.findByTournamentId(tournamentId);
    const positionTaken = tournamentResults.some(result => result.position.value === position);
    if (positionTaken) {
      throw new Error(`Position ${position} is already taken in this tournament`);
    }
  }

  private generateGameResultId(): string {
    // In a real implementation, this would use a proper ID generator
    return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private toResponseDto(gameResult: GameResult): GameResultResponseDto {
    return {
      id: gameResult.id,
      tournamentId: gameResult.tournamentId,
      player: {
        id: gameResult.player.id,
        name: gameResult.player.name,
      },
      position: gameResult.position.value,
      points: gameResult.points.value,
      bountyCount: gameResult.bountyCount,
      isConsolation: gameResult.isConsolation,
      notes: gameResult.notes,
      gameTime: gameResult.gameTime.toISOString(),
      totalPoints: gameResult.getTotalPoints().value,
    };
  }
}
