import { Position } from '../position';

describe('Position Value Object', () => {
  describe('constructor', () => {
    it('should create a valid position with positive integer', () => {
      const position = new Position(1);
      expect(position.value).toBe(1);
    });

    it('should throw error for zero position', () => {
      expect(() => new Position(0)).toThrow('Position must be a positive integer');
    });

    it('should throw error for negative position', () => {
      expect(() => new Position(-1)).toThrow('Position must be a positive integer');
    });

    it('should throw error for non-integer position', () => {
      expect(() => new Position(1.5)).toThrow('Position must be a positive integer');
    });

    it('should throw error for NaN', () => {
      expect(() => new Position(NaN)).toThrow('Position must be a positive integer');
    });

    it('should throw error for Infinity', () => {
      expect(() => new Position(Infinity)).toThrow('Position must be a positive integer');
    });
  });

  describe('qualifiesForPoints', () => {
    it('should return true for positions 1-10', () => {
      for (let i = 1; i <= 10; i++) {
        const position = new Position(i);
        expect(position.qualifiesForPoints()).toBe(true);
      }
    });

    it('should return false for positions greater than 10', () => {
      const position11 = new Position(11);
      const position50 = new Position(50);
      
      expect(position11.qualifiesForPoints()).toBe(false);
      expect(position50.qualifiesForPoints()).toBe(false);
    });
  });

  describe('isWinner', () => {
    it('should return true only for position 1', () => {
      const winner = new Position(1);
      expect(winner.isWinner()).toBe(true);
    });

    it('should return false for any position other than 1', () => {
      const second = new Position(2);
      const third = new Position(3);
      const tenth = new Position(10);
      
      expect(second.isWinner()).toBe(false);
      expect(third.isWinner()).toBe(false);
      expect(tenth.isWinner()).toBe(false);
    });
  });

  describe('isTopThree', () => {
    it('should return true for positions 1, 2, and 3', () => {
      const first = new Position(1);
      const second = new Position(2);
      const third = new Position(3);
      
      expect(first.isTopThree()).toBe(true);
      expect(second.isTopThree()).toBe(true);
      expect(third.isTopThree()).toBe(true);
    });

    it('should return false for positions greater than 3', () => {
      const fourth = new Position(4);
      const tenth = new Position(10);
      
      expect(fourth.isTopThree()).toBe(false);
      expect(tenth.isTopThree()).toBe(false);
    });
  });

  describe('isBetterThan', () => {
    it('should return true when position is lower (better)', () => {
      const first = new Position(1);
      const second = new Position(2);
      
      expect(first.isBetterThan(second)).toBe(true);
    });

    it('should return false when position is higher (worse)', () => {
      const second = new Position(2);
      const first = new Position(1);
      
      expect(second.isBetterThan(first)).toBe(false);
    });

    it('should return false when positions are equal', () => {
      const position1 = new Position(5);
      const position2 = new Position(5);
      
      expect(position1.isBetterThan(position2)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for positions with same value', () => {
      const position1 = new Position(5);
      const position2 = new Position(5);
      
      expect(position1.equals(position2)).toBe(true);
    });

    it('should return false for positions with different values', () => {
      const position1 = new Position(5);
      const position2 = new Position(6);
      
      expect(position1.equals(position2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation of position value', () => {
      const position = new Position(5);
      expect(position.toString()).toBe('5');
    });
  });

  describe('edge cases', () => {
    it('should handle very large positions', () => {
      const largePosition = new Position(1000);
      expect(largePosition.value).toBe(1000);
      expect(largePosition.qualifiesForPoints()).toBe(false);
      expect(largePosition.isWinner()).toBe(false);
      expect(largePosition.isTopThree()).toBe(false);
    });
  });
});
