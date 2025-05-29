import { Position } from '@/src/core/domain/value-objects/position';
import { Points } from '@/src/core/domain/value-objects/points';

/**
 * Interface for scoring strategies
 */
export interface IScoringStrategy {
  calculatePoints(position: Position, totalPlayers: number): Points;
  getName(): string;
  getDescription(): string;
}

/**
 * Standard weighted scoring strategy
 * Points = totalPlayers * (11 - position) for positions 1-10, 0 for others
 */
export class WeightedScoringStrategy implements IScoringStrategy {
  private readonly maxPointPositions: number;

  constructor(maxPointPositions: number = 10) {
    if (maxPointPositions < 1) {
      throw new Error('Max point positions must be at least 1');
    }
    this.maxPointPositions = maxPointPositions;
  }

  calculatePoints(position: Position, totalPlayers: number): Points {
    if (totalPlayers < 1) {
      throw new Error('Total players must be at least 1');
    }

    if (position.value > this.maxPointPositions) {
      return Points.zero();
    }

    const points = totalPlayers * (this.maxPointPositions + 1 - position.value);
    return new Points(points);
  }

  getName(): string {
    return 'Weighted Scoring';
  }

  getDescription(): string {
    return `Points = totalPlayers × (${this.maxPointPositions + 1} - position) for top ${this.maxPointPositions} positions`;
  }
}

/**
 * Fixed points scoring strategy
 * Fixed points for each position regardless of field size
 */
export class FixedPointsScoringStrategy implements IScoringStrategy {
  private readonly pointsTable: Map<number, number>;

  constructor(pointsTable: Record<number, number> = {}) {
    this.pointsTable = new Map();
    
    // Default points table if none provided
    if (Object.keys(pointsTable).length === 0) {
      const defaultPoints = {
        1: 100, 2: 80, 3: 60, 4: 50, 5: 40,
        6: 30, 7: 25, 8: 20, 9: 15, 10: 10
      };
      Object.entries(defaultPoints).forEach(([pos, points]) => {
        this.pointsTable.set(Number(pos), points);
      });
    } else {
      Object.entries(pointsTable).forEach(([pos, points]) => {
        if (points < 0) {
          throw new Error('Points cannot be negative');
        }
        this.pointsTable.set(Number(pos), points);
      });
    }
  }

  calculatePoints(position: Position, totalPlayers: number): Points {
    if (totalPlayers < 1) {
      throw new Error('Total players must be at least 1');
    }

    const points = this.pointsTable.get(position.value) ?? 0;
    return new Points(points);
  }

  getName(): string {
    return 'Fixed Points';
  }

  getDescription(): string {
    const positions = Array.from(this.pointsTable.keys()).sort((a, b) => a - b);
    const examples = positions.slice(0, 3).map(pos => `${pos}st: ${this.pointsTable.get(pos)}`);
    return `Fixed points per position (${examples.join(', ')}, ...)`;
  }

  getPointsForPosition(position: number): number {
    return this.pointsTable.get(position) ?? 0;
  }
}

/**
 * Percentage-based scoring strategy
 * Points based on percentage of field beaten
 */
export class PercentageScoringStrategy implements IScoringStrategy {
  private readonly maxPoints: number;
  private readonly minPointsPosition: number;

  constructor(maxPoints: number = 100, minPointsPosition: number = 10) {
    if (maxPoints <= 0) {
      throw new Error('Max points must be positive');
    }
    if (minPointsPosition < 1) {
      throw new Error('Min points position must be at least 1');
    }
    
    this.maxPoints = maxPoints;
    this.minPointsPosition = minPointsPosition;
  }

  calculatePoints(position: Position, totalPlayers: number): Points {
    if (totalPlayers < 1) {
      throw new Error('Total players must be at least 1');
    }

    if (position.value > this.minPointsPosition) {
      return Points.zero();
    }

    // Calculate percentage of field beaten
    const playersBehind = totalPlayers - position.value;
    const percentageBehind = playersBehind / totalPlayers;
    
    // Scale to max points
    const points = Math.round(percentageBehind * this.maxPoints);
    return new Points(points);
  }

  getName(): string {
    return 'Percentage Scoring';
  }

  getDescription(): string {
    return `Points based on percentage of field beaten (max ${this.maxPoints} points, top ${this.minPointsPosition} positions only)`;
  }
}

/**
 * Winner-takes-all scoring strategy
 * Only the winner gets points
 */
export class WinnerTakesAllScoringStrategy implements IScoringStrategy {
  private readonly winnerPoints: number;

  constructor(winnerPoints: number = 100) {
    if (winnerPoints <= 0) {
      throw new Error('Winner points must be positive');
    }
    this.winnerPoints = winnerPoints;
  }

  calculatePoints(position: Position, totalPlayers: number): Points {
    if (totalPlayers < 1) {
      throw new Error('Total players must be at least 1');
    }

    return position.isWinner() ? new Points(this.winnerPoints) : Points.zero();
  }

  getName(): string {
    return 'Winner Takes All';
  }

  getDescription(): string {
    return `Winner gets ${this.winnerPoints} points, all others get 0`;
  }
}

/**
 * Scoring strategy factory
 */
export class ScoringStrategyFactory {
  private static strategies = new Map<string, () => IScoringStrategy>([
    ['weighted', () => new WeightedScoringStrategy()],
    ['fixed', () => new FixedPointsScoringStrategy()],
    ['percentage', () => new PercentageScoringStrategy()],
    ['winner-takes-all', () => new WinnerTakesAllScoringStrategy()],
  ]);

  static create(strategyName: string): IScoringStrategy {
    const factory = this.strategies.get(strategyName.toLowerCase());
    if (!factory) {
      throw new Error(`Unknown scoring strategy: ${strategyName}`);
    }

    // For now, return default strategy. In the future, we can pass options
    return factory();
  }

  static getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  static register(name: string, factory: () => IScoringStrategy): void {
    this.strategies.set(name.toLowerCase(), factory);
  }
}
