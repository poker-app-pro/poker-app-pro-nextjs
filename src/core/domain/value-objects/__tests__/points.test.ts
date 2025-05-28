import { Points } from '../points';

describe('Points Value Object', () => {
  describe('constructor', () => {
    it('should create valid points with non-negative integer', () => {
      const points = new Points(100);
      expect(points.value).toBe(100);
    });

    it('should create valid points with zero', () => {
      const points = new Points(0);
      expect(points.value).toBe(0);
    });

    it('should throw error for negative points', () => {
      expect(() => new Points(-1)).toThrow('Points must be a non-negative integer');
    });

    it('should throw error for non-integer points', () => {
      expect(() => new Points(10.5)).toThrow('Points must be a non-negative integer');
    });

    it('should throw error for NaN', () => {
      expect(() => new Points(NaN)).toThrow('Points must be a non-negative integer');
    });

    it('should throw error for Infinity', () => {
      expect(() => new Points(Infinity)).toThrow('Points must be a non-negative integer');
    });
  });

  describe('add', () => {
    it('should add two positive point values', () => {
      const points1 = new Points(50);
      const points2 = new Points(30);
      const result = points1.add(points2);
      
      expect(result.value).toBe(80);
    });

    it('should add zero points', () => {
      const points1 = new Points(50);
      const points2 = new Points(0);
      const result = points1.add(points2);
      
      expect(result.value).toBe(50);
    });

    it('should return new Points instance', () => {
      const points1 = new Points(50);
      const points2 = new Points(30);
      const result = points1.add(points2);
      
      expect(result).not.toBe(points1);
      expect(result).not.toBe(points2);
      expect(points1.value).toBe(50); // Original unchanged
      expect(points2.value).toBe(30); // Original unchanged
    });
  });

  describe('isZero', () => {
    it('should return true for zero points', () => {
      const points = new Points(0);
      expect(points.isZero()).toBe(true);
    });

    it('should return false for positive points', () => {
      const points = new Points(10);
      expect(points.isZero()).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('should return true for positive points', () => {
      const points = new Points(10);
      expect(points.isPositive()).toBe(true);
    });

    it('should return false for zero points', () => {
      const points = new Points(0);
      expect(points.isPositive()).toBe(false);
    });
  });

  describe('isGreaterThan', () => {
    it('should return true when points are greater', () => {
      const points1 = new Points(100);
      const points2 = new Points(50);
      
      expect(points1.isGreaterThan(points2)).toBe(true);
    });

    it('should return false when points are less', () => {
      const points1 = new Points(50);
      const points2 = new Points(100);
      
      expect(points1.isGreaterThan(points2)).toBe(false);
    });

    it('should return false when points are equal', () => {
      const points1 = new Points(50);
      const points2 = new Points(50);
      
      expect(points1.isGreaterThan(points2)).toBe(false);
    });
  });

  describe('isLessThan', () => {
    it('should return true when points are less', () => {
      const points1 = new Points(50);
      const points2 = new Points(100);
      
      expect(points1.isLessThan(points2)).toBe(true);
    });

    it('should return false when points are greater', () => {
      const points1 = new Points(100);
      const points2 = new Points(50);
      
      expect(points1.isLessThan(points2)).toBe(false);
    });

    it('should return false when points are equal', () => {
      const points1 = new Points(50);
      const points2 = new Points(50);
      
      expect(points1.isLessThan(points2)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal points', () => {
      const points1 = new Points(50);
      const points2 = new Points(50);
      
      expect(points1.equals(points2)).toBe(true);
    });

    it('should return false for different points', () => {
      const points1 = new Points(50);
      const points2 = new Points(100);
      
      expect(points1.equals(points2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation of points value', () => {
      const points = new Points(150);
      expect(points.toString()).toBe('150');
    });

    it('should return "0" for zero points', () => {
      const points = new Points(0);
      expect(points.toString()).toBe('0');
    });
  });

  describe('static zero', () => {
    it('should create zero points', () => {
      const points = Points.zero();
      expect(points.value).toBe(0);
      expect(points.isZero()).toBe(true);
    });

    it('should return new instance each time', () => {
      const points1 = Points.zero();
      const points2 = Points.zero();
      
      expect(points1).not.toBe(points2);
      expect(points1.equals(points2)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle very large point values', () => {
      const largePoints = new Points(1000000);
      expect(largePoints.value).toBe(1000000);
      expect(largePoints.isPositive()).toBe(true);
      expect(largePoints.isZero()).toBe(false);
    });

    it('should handle addition with large values', () => {
      const points1 = new Points(999999);
      const points2 = new Points(1);
      const result = points1.add(points2);
      
      expect(result.value).toBe(1000000);
    });
  });
});
