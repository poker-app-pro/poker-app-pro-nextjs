import { Position } from '@/src/core/domain/value-objects/position';
import { Points } from '@/src/core/domain/value-objects/points';
import { ScoringStrategyFactory } from '@/src/core/domain/services/scoring-strategy';
import { CalculatePointsDto, PointsCalculationResponseDto } from '@/src/core/application/dtos/game-result.dto';

/**
 * Calculate Points Use Case
 * Handles the business logic for calculating points using different scoring strategies
 */
export class CalculatePointsUseCase {
  async execute(dto: CalculatePointsDto): Promise<PointsCalculationResponseDto> {
    // Validate input
    this.validateInput(dto);

    // Create value objects
    const position = new Position(dto.position);

    // Get scoring strategy
    const strategy = ScoringStrategyFactory.create(dto.strategyName);

    // Calculate base points
    const basePoints = strategy.calculatePoints(position, dto.totalPlayers);

    // Calculate bounty points
    const bountyCount = dto.bountyCount ?? 0;
    const bountyPointValue = dto.bountyPointValue ?? 1;
    const bountyPoints = new Points(bountyCount * bountyPointValue);

    // Calculate total points
    const totalPoints = basePoints.add(bountyPoints);

    return {
      basePoints: basePoints.value,
      bountyPoints: bountyPoints.value,
      totalPoints: totalPoints.value,
      strategyUsed: strategy.getName(),
    };
  }

  private validateInput(dto: CalculatePointsDto): void {
    if (dto.position < 1) {
      throw new Error('Position must be greater than 0');
    }

    if (dto.totalPlayers < 1) {
      throw new Error('Total players must be greater than 0');
    }

    if (dto.position > dto.totalPlayers) {
      throw new Error('Position cannot be greater than total players');
    }

    if (!dto.strategyName?.trim()) {
      throw new Error('Strategy name is required');
    }

    if (dto.bountyCount !== undefined && dto.bountyCount < 0) {
      throw new Error('Bounty count cannot be negative');
    }

    if (dto.bountyPointValue !== undefined && dto.bountyPointValue < 0) {
      throw new Error('Bounty point value cannot be negative');
    }

    // Validate strategy exists
    const availableStrategies = ScoringStrategyFactory.getAvailableStrategies();
    if (!availableStrategies.includes(dto.strategyName.toLowerCase())) {
      throw new Error(`Unknown scoring strategy: ${dto.strategyName}. Available strategies: ${availableStrategies.join(', ')}`);
    }
  }
}
