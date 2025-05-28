import {
  IScoringStrategy,
  WeightedScoringStrategy,
  FixedPointsScoringStrategy,
  PercentageScoringStrategy,
  WinnerTakesAllScoringStrategy,
  ScoringStrategyFactory
} from '../scoring-strategy';
import { Position } from '../../value-objects/position';
import { Points } from '../../value-objects/points';

describe('Scoring Strategies', () => {
  describe('WeightedScoringStrategy', () => {
    let strategy: WeightedScoringStrategy;

    beforeEach(() => {
      strategy = new WeightedScoringStrategy();
    });

    it('should calculate points correctly for top 10 positions', () => {
      const totalPlayers = 20;
      
      // 1st place: 20 * (11 - 1) = 200
      expect(strategy.calculatePoints(new Position(1), totalPlayers).value).toBe(200);
      
      // 5th place: 20 * (11 - 5) = 120
      expect(strategy.calculatePoints(new Position(5), totalPlayers).value).toBe(120);
      
      // 10th place: 20 * (11 - 10) = 20
      expect(strategy.calculatePoints(new Position(10), totalPlayers).value).toBe(20);
    });

    it('should return zero points for positions beyond 10th', () => {
      const totalPlayers = 20;
      
      expect(strategy.calculatePoints(new Position(11), totalPlayers).value).toBe(0);
      expect(strategy.calculatePoints(new Position(15), totalPlayers).value).toBe(0);
    });

    it('should work with custom max point positions', () => {
      const customStrategy = new WeightedScoringStrategy(5);
      const totalPlayers = 10;
      
      // 1st place: 10 * (6 - 1) = 50
      expect(customStrategy.calculatePoints(new Position(1), totalPlayers).value).toBe(50);
      
      // 5th place: 10 * (6 - 5) = 10
      expect(customStrategy.calculatePoints(new Position(5), totalPlayers).value).toBe(10);
      
      // 6th place: 0 (beyond max point positions)
      expect(customStrategy.calculatePoints(new Position(6), totalPlayers).value).toBe(0);
    });

    it('should throw error for invalid total players', () => {
      expect(() => strategy.calculatePoints(new Position(1), 0))
        .toThrow('Total players must be at least 1');
      expect(() => strategy.calculatePoints(new Position(1), -1))
        .toThrow('Total players must be at least 1');
    });

    it('should throw error for invalid max point positions', () => {
      expect(() => new WeightedScoringStrategy(0))
        .toThrow('Max point positions must be at least 1');
      expect(() => new WeightedScoringStrategy(-1))
        .toThrow('Max point positions must be at least 1');
    });

    it('should have correct name and description', () => {
      expect(strategy.getName()).toBe('Weighted Scoring');
      expect(strategy.getDescription()).toContain('Points = totalPlayers × (11 - position)');
    });
  });

  describe('FixedPointsScoringStrategy', () => {
    let strategy: FixedPointsScoringStrategy;

    beforeEach(() => {
      strategy = new FixedPointsScoringStrategy();
    });

    it('should use default points table', () => {
      expect(strategy.calculatePoints(new Position(1), 20).value).toBe(100);
      expect(strategy.calculatePoints(new Position(2), 20).value).toBe(80);
      expect(strategy.calculatePoints(new Position(3), 20).value).toBe(60);
      expect(strategy.calculatePoints(new Position(10), 20).value).toBe(10);
    });

    it('should return zero for positions not in table', () => {
      expect(strategy.calculatePoints(new Position(11), 20).value).toBe(0);
      expect(strategy.calculatePoints(new Position(15), 20).value).toBe(0);
    });

    it('should work with custom points table', () => {
      const customStrategy = new FixedPointsScoringStrategy({
        1: 50, 2: 30, 3: 20, 4: 10
      });
      
      expect(customStrategy.calculatePoints(new Position(1), 20).value).toBe(50);
      expect(customStrategy.calculatePoints(new Position(2), 20).value).toBe(30);
      expect(customStrategy.calculatePoints(new Position(3), 20).value).toBe(20);
      expect(customStrategy.calculatePoints(new Position(4), 20).value).toBe(10);
      expect(customStrategy.calculatePoints(new Position(5), 20).value).toBe(0);
    });

    it('should throw error for negative points in custom table', () => {
      expect(() => new FixedPointsScoringStrategy({ 1: -10 }))
        .toThrow('Points cannot be negative');
    });

    it('should throw error for invalid total players', () => {
      expect(() => strategy.calculatePoints(new Position(1), 0))
        .toThrow('Total players must be at least 1');
    });

    it('should have correct name and description', () => {
      expect(strategy.getName()).toBe('Fixed Points');
      expect(strategy.getDescription()).toContain('Fixed points per position');
    });

    it('should return correct points for position', () => {
      expect(strategy.getPointsForPosition(1)).toBe(100);
      expect(strategy.getPointsForPosition(2)).toBe(80);
      expect(strategy.getPointsForPosition(11)).toBe(0);
    });
  });

  describe('PercentageScoringStrategy', () => {
    let strategy: PercentageScoringStrategy;

    beforeEach(() => {
      strategy = new PercentageScoringStrategy();
    });

    it('should calculate points based on percentage of field beaten', () => {
      const totalPlayers = 20;
      
      // 1st place: (20-1)/20 * 100 = 95
      expect(strategy.calculatePoints(new Position(1), totalPlayers).value).toBe(95);
      
      // 5th place: (20-5)/20 * 100 = 75
      expect(strategy.calculatePoints(new Position(5), totalPlayers).value).toBe(75);
      
      // 10th place: (20-10)/20 * 100 = 50
      expect(strategy.calculatePoints(new Position(10), totalPlayers).value).toBe(50);
    });

    it('should return zero for positions beyond min points position', () => {
      expect(strategy.calculatePoints(new Position(11), 20).value).toBe(0);
      expect(strategy.calculatePoints(new Position(15), 20).value).toBe(0);
    });

    it('should work with custom max points and min position', () => {
      const customStrategy = new PercentageScoringStrategy(200, 5);
      const totalPlayers = 10;
      
      // 1st place: (10-1)/10 * 200 = 180
      expect(customStrategy.calculatePoints(new Position(1), totalPlayers).value).toBe(180);
      
      // 5th place: (10-5)/10 * 200 = 100
      expect(customStrategy.calculatePoints(new Position(5), totalPlayers).value).toBe(100);
      
      // 6th place: 0 (beyond min points position)
      expect(customStrategy.calculatePoints(new Position(6), totalPlayers).value).toBe(0);
    });

    it('should throw error for invalid parameters', () => {
      expect(() => new PercentageScoringStrategy(0))
        .toThrow('Max points must be positive');
      expect(() => new PercentageScoringStrategy(-10))
        .toThrow('Max points must be positive');
      expect(() => new PercentageScoringStrategy(100, 0))
        .toThrow('Min points position must be at least 1');
    });

    it('should throw error for invalid total players', () => {
      expect(() => strategy.calculatePoints(new Position(1), 0))
        .toThrow('Total players must be at least 1');
    });

    it('should have correct name and description', () => {
      expect(strategy.getName()).toBe('Percentage Scoring');
      expect(strategy.getDescription()).toContain('percentage of field beaten');
    });
  });

  describe('WinnerTakesAllScoringStrategy', () => {
    let strategy: WinnerTakesAllScoringStrategy;

    beforeEach(() => {
      strategy = new WinnerTakesAllScoringStrategy();
    });

    it('should give points only to winner', () => {
      expect(strategy.calculatePoints(new Position(1), 20).value).toBe(100);
      expect(strategy.calculatePoints(new Position(2), 20).value).toBe(0);
      expect(strategy.calculatePoints(new Position(3), 20).value).toBe(0);
      expect(strategy.calculatePoints(new Position(10), 20).value).toBe(0);
    });

    it('should work with custom winner points', () => {
      const customStrategy = new WinnerTakesAllScoringStrategy(50);
      
      expect(customStrategy.calculatePoints(new Position(1), 20).value).toBe(50);
      expect(customStrategy.calculatePoints(new Position(2), 20).value).toBe(0);
    });

    it('should throw error for invalid winner points', () => {
      expect(() => new WinnerTakesAllScoringStrategy(0))
        .toThrow('Winner points must be positive');
      expect(() => new WinnerTakesAllScoringStrategy(-10))
        .toThrow('Winner points must be positive');
    });

    it('should throw error for invalid total players', () => {
      expect(() => strategy.calculatePoints(new Position(1), 0))
        .toThrow('Total players must be at least 1');
    });

    it('should have correct name and description', () => {
      expect(strategy.getName()).toBe('Winner Takes All');
      expect(strategy.getDescription()).toContain('Winner gets 100 points');
    });
  });

  describe('ScoringStrategyFactory', () => {
    it('should create weighted strategy', () => {
      const strategy = ScoringStrategyFactory.create('weighted');
      expect(strategy).toBeInstanceOf(WeightedScoringStrategy);
      expect(strategy.getName()).toBe('Weighted Scoring');
    });

    it('should create fixed points strategy', () => {
      const strategy = ScoringStrategyFactory.create('fixed');
      expect(strategy).toBeInstanceOf(FixedPointsScoringStrategy);
      expect(strategy.getName()).toBe('Fixed Points');
    });

    it('should create percentage strategy', () => {
      const strategy = ScoringStrategyFactory.create('percentage');
      expect(strategy).toBeInstanceOf(PercentageScoringStrategy);
      expect(strategy.getName()).toBe('Percentage Scoring');
    });

    it('should create winner takes all strategy', () => {
      const strategy = ScoringStrategyFactory.create('winner-takes-all');
      expect(strategy).toBeInstanceOf(WinnerTakesAllScoringStrategy);
      expect(strategy.getName()).toBe('Winner Takes All');
    });

    it('should be case insensitive', () => {
      const strategy1 = ScoringStrategyFactory.create('WEIGHTED');
      const strategy2 = ScoringStrategyFactory.create('WeIgHtEd');
      
      expect(strategy1).toBeInstanceOf(WeightedScoringStrategy);
      expect(strategy2).toBeInstanceOf(WeightedScoringStrategy);
    });

    it('should throw error for unknown strategy', () => {
      expect(() => ScoringStrategyFactory.create('unknown'))
        .toThrow('Unknown scoring strategy: unknown');
    });

    it('should return available strategies', () => {
      const strategies = ScoringStrategyFactory.getAvailableStrategies();
      
      expect(strategies).toContain('weighted');
      expect(strategies).toContain('fixed');
      expect(strategies).toContain('percentage');
      expect(strategies).toContain('winner-takes-all');
      expect(strategies.length).toBe(4);
    });

    it('should allow registering custom strategies', () => {
      class CustomStrategy implements IScoringStrategy {
        calculatePoints(): Points { return new Points(42); }
        getName(): string { return 'Custom'; }
        getDescription(): string { return 'Custom strategy'; }
      }
      
      ScoringStrategyFactory.register('custom', () => new CustomStrategy());
      
      const strategy = ScoringStrategyFactory.create('custom');
      expect(strategy).toBeInstanceOf(CustomStrategy);
      expect(strategy.getName()).toBe('Custom');
      
      const strategies = ScoringStrategyFactory.getAvailableStrategies();
      expect(strategies).toContain('custom');
    });
  });
});
