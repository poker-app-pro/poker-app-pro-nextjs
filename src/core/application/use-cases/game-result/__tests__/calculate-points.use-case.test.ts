import { CalculatePointsUseCase } from '../calculate-points.use-case';
import { CalculatePointsDto } from '../../../dtos/game-result.dto';

describe('CalculatePointsUseCase', () => {
  let useCase: CalculatePointsUseCase;

  beforeEach(() => {
    useCase = new CalculatePointsUseCase();
  });

  describe('execute', () => {
    it('should calculate points using weighted strategy', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 20,
        strategyName: 'weighted',
      };

      const result = await useCase.execute(dto);

      expect(result).toEqual({
        basePoints: 200, // 20 * (11 - 1)
        bountyPoints: 0,
        totalPoints: 200,
        strategyUsed: 'Weighted Scoring',
      });
    });

    it('should calculate points with bounties', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 20,
        strategyName: 'weighted',
        bountyCount: 3,
        bountyPointValue: 5,
      };

      const result = await useCase.execute(dto);

      expect(result).toEqual({
        basePoints: 200, // 20 * (11 - 1)
        bountyPoints: 15, // 3 * 5
        totalPoints: 215, // 200 + 15
        strategyUsed: 'Weighted Scoring',
      });
    });

    it('should calculate points using fixed strategy', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 20,
        strategyName: 'fixed',
      };

      const result = await useCase.execute(dto);

      expect(result).toEqual({
        basePoints: 100, // Default fixed points for 1st place
        bountyPoints: 0,
        totalPoints: 100,
        strategyUsed: 'Fixed Points',
      });
    });

    it('should calculate points using percentage strategy', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 20,
        strategyName: 'percentage',
      };

      const result = await useCase.execute(dto);

      expect(result).toEqual({
        basePoints: 95, // (20-1)/20 * 100
        bountyPoints: 0,
        totalPoints: 95,
        strategyUsed: 'Percentage Scoring',
      });
    });

    it('should calculate points using winner-takes-all strategy', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 20,
        strategyName: 'winner-takes-all',
      };

      const result = await useCase.execute(dto);

      expect(result).toEqual({
        basePoints: 100, // Winner gets 100 points
        bountyPoints: 0,
        totalPoints: 100,
        strategyUsed: 'Winner Takes All',
      });
    });

    it('should return zero points for non-winner in winner-takes-all', async () => {
      const dto: CalculatePointsDto = {
        position: 2,
        totalPlayers: 20,
        strategyName: 'winner-takes-all',
      };

      const result = await useCase.execute(dto);

      expect(result).toEqual({
        basePoints: 0,
        bountyPoints: 0,
        totalPoints: 0,
        strategyUsed: 'Winner Takes All',
      });
    });

    it('should handle default bounty values', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 10,
        strategyName: 'weighted',
        bountyCount: 2,
        // bountyPointValue not specified, should default to 1
      };

      const result = await useCase.execute(dto);

      expect(result).toEqual({
        basePoints: 100, // 10 * (11 - 1)
        bountyPoints: 2, // 2 * 1 (default)
        totalPoints: 102,
        strategyUsed: 'Weighted Scoring',
      });
    });

    it('should handle zero bounties', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 10,
        strategyName: 'weighted',
        bountyCount: 0,
      };

      const result = await useCase.execute(dto);

      expect(result.bountyPoints).toBe(0);
      expect(result.totalPoints).toBe(result.basePoints);
    });

    it('should be case insensitive for strategy names', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 10,
        strategyName: 'WEIGHTED',
      };

      const result = await useCase.execute(dto);

      expect(result.strategyUsed).toBe('Weighted Scoring');
    });

    // Validation tests
    it('should throw error for invalid position', async () => {
      const dto: CalculatePointsDto = {
        position: 0,
        totalPlayers: 10,
        strategyName: 'weighted',
      };

      await expect(useCase.execute(dto)).rejects.toThrow('Position must be greater than 0');
    });

    it('should throw error for invalid total players', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 0,
        strategyName: 'weighted',
      };

      await expect(useCase.execute(dto)).rejects.toThrow('Total players must be greater than 0');
    });

    it('should throw error when position exceeds total players', async () => {
      const dto: CalculatePointsDto = {
        position: 11,
        totalPlayers: 10,
        strategyName: 'weighted',
      };

      await expect(useCase.execute(dto)).rejects.toThrow('Position cannot be greater than total players');
    });

    it('should throw error for empty strategy name', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 10,
        strategyName: '',
      };

      await expect(useCase.execute(dto)).rejects.toThrow('Strategy name is required');
    });

    it('should throw error for unknown strategy', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 10,
        strategyName: 'unknown-strategy',
      };

      await expect(useCase.execute(dto)).rejects.toThrow('Unknown scoring strategy: unknown-strategy');
    });

    it('should throw error for negative bounty count', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 10,
        strategyName: 'weighted',
        bountyCount: -1,
      };

      await expect(useCase.execute(dto)).rejects.toThrow('Bounty count cannot be negative');
    });

    it('should throw error for negative bounty point value', async () => {
      const dto: CalculatePointsDto = {
        position: 1,
        totalPlayers: 10,
        strategyName: 'weighted',
        bountyCount: 1,
        bountyPointValue: -1,
      };

      await expect(useCase.execute(dto)).rejects.toThrow('Bounty point value cannot be negative');
    });
  });
});
