import { GameTime } from '../game-time';

describe('GameTime Value Object', () => {
  const fixedDate = new Date('2024-01-15T14:30:00.000Z');
  const pastDate = new Date('2020-01-01T12:00:00.000Z');
  const futureDate = new Date('2030-12-31T23:59:59.999Z');

  describe('constructor', () => {
    it('should create GameTime with Date object', () => {
      const gameTime = new GameTime(fixedDate);
      expect(gameTime.value.getTime()).toBe(fixedDate.getTime());
    });

    it('should create GameTime with ISO string', () => {
      const isoString = '2024-01-15T14:30:00.000Z';
      const gameTime = new GameTime(isoString);
      expect(gameTime.toISOString()).toBe(isoString);
    });

    it('should create GameTime with date string', () => {
      const dateString = '2024-01-15';
      const gameTime = new GameTime(dateString);
      expect(gameTime.toDateString()).toBe('2024-01-15');
    });

    it('should throw error for invalid date string', () => {
      expect(() => new GameTime('invalid-date')).toThrow('GameTime must be a valid date');
    });

    it('should throw error for invalid Date object', () => {
      expect(() => new GameTime(new Date('invalid'))).toThrow('GameTime must be a valid date');
    });

    it('should create immutable copy of Date', () => {
      const originalDate = new Date('2024-01-15T14:30:00.000Z');
      const gameTime = new GameTime(originalDate);
      
      // Modify original date
      originalDate.setFullYear(2025);
      
      // GameTime should be unchanged
      expect(gameTime.value.getFullYear()).toBe(2024);
    });
  });

  describe('value getter', () => {
    it('should return a copy of the internal date', () => {
      const gameTime = new GameTime(fixedDate);
      const returnedDate = gameTime.value;
      
      // Modify returned date
      returnedDate.setFullYear(2025);
      
      // GameTime should be unchanged
      expect(gameTime.value.getFullYear()).toBe(2024);
    });
  });

  describe('isInPast', () => {
    it('should return true for past dates', () => {
      const gameTime = new GameTime(pastDate);
      expect(gameTime.isInPast()).toBe(true);
    });

    it('should return false for future dates', () => {
      const gameTime = new GameTime(futureDate);
      expect(gameTime.isInPast()).toBe(false);
    });
  });

  describe('isInFuture', () => {
    it('should return true for future dates', () => {
      const gameTime = new GameTime(futureDate);
      expect(gameTime.isInFuture()).toBe(true);
    });

    it('should return false for past dates', () => {
      const gameTime = new GameTime(pastDate);
      expect(gameTime.isInFuture()).toBe(false);
    });
  });

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = new Date();
      const gameTime = new GameTime(today);
      expect(gameTime.isToday()).toBe(true);
    });

    it('should return false for different date', () => {
      const gameTime = new GameTime(pastDate);
      expect(gameTime.isToday()).toBe(false);
    });

    it('should return true for today with different time', () => {
      const today = new Date();
      const todayDifferentTime = new Date(today);
      todayDifferentTime.setHours(23, 59, 59, 999);
      
      const gameTime = new GameTime(todayDifferentTime);
      expect(gameTime.isToday()).toBe(true);
    });
  });

  describe('toDateString', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const gameTime = new GameTime('2024-01-15T14:30:00.000Z');
      expect(gameTime.toDateString()).toBe('2024-01-15');
    });
  });

  describe('toISOString', () => {
    it('should return full ISO string', () => {
      const isoString = '2024-01-15T14:30:00.000Z';
      const gameTime = new GameTime(isoString);
      expect(gameTime.toISOString()).toBe(isoString);
    });
  });

  describe('isBefore', () => {
    it('should return true when date is before other', () => {
      const earlier = new GameTime(pastDate);
      const later = new GameTime(futureDate);
      
      expect(earlier.isBefore(later)).toBe(true);
    });

    it('should return false when date is after other', () => {
      const earlier = new GameTime(pastDate);
      const later = new GameTime(futureDate);
      
      expect(later.isBefore(earlier)).toBe(false);
    });

    it('should return false when dates are equal', () => {
      const gameTime1 = new GameTime(fixedDate);
      const gameTime2 = new GameTime(fixedDate);
      
      expect(gameTime1.isBefore(gameTime2)).toBe(false);
    });
  });

  describe('isAfter', () => {
    it('should return true when date is after other', () => {
      const earlier = new GameTime(pastDate);
      const later = new GameTime(futureDate);
      
      expect(later.isAfter(earlier)).toBe(true);
    });

    it('should return false when date is before other', () => {
      const earlier = new GameTime(pastDate);
      const later = new GameTime(futureDate);
      
      expect(earlier.isAfter(later)).toBe(false);
    });

    it('should return false when dates are equal', () => {
      const gameTime1 = new GameTime(fixedDate);
      const gameTime2 = new GameTime(fixedDate);
      
      expect(gameTime1.isAfter(gameTime2)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal dates', () => {
      const gameTime1 = new GameTime(fixedDate);
      const gameTime2 = new GameTime(fixedDate);
      
      expect(gameTime1.equals(gameTime2)).toBe(true);
    });

    it('should return false for different dates', () => {
      const gameTime1 = new GameTime(pastDate);
      const gameTime2 = new GameTime(futureDate);
      
      expect(gameTime1.equals(gameTime2)).toBe(false);
    });

    it('should return true for same timestamp from different sources', () => {
      const isoString = '2024-01-15T14:30:00.000Z';
      const gameTime1 = new GameTime(isoString);
      const gameTime2 = new GameTime(new Date(isoString));
      
      expect(gameTime1.equals(gameTime2)).toBe(true);
    });
  });

  describe('toDisplayString', () => {
    it('should return locale string representation', () => {
      const gameTime = new GameTime(fixedDate);
      const displayString = gameTime.toDisplayString();
      
      expect(typeof displayString).toBe('string');
      expect(displayString.length).toBeGreaterThan(0);
    });
  });

  describe('toString', () => {
    it('should return ISO string representation', () => {
      const isoString = '2024-01-15T14:30:00.000Z';
      const gameTime = new GameTime(isoString);
      
      expect(gameTime.toString()).toBe(isoString);
    });
  });

  describe('static now', () => {
    it('should create GameTime for current time', () => {
      const before = Date.now();
      const gameTime = GameTime.now();
      const after = Date.now();
      
      const gameTimeMs = gameTime.value.getTime();
      expect(gameTimeMs).toBeGreaterThanOrEqual(before);
      expect(gameTimeMs).toBeLessThanOrEqual(after);
    });
  });

  describe('static fromISOString', () => {
    it('should create GameTime from ISO string', () => {
      const isoString = '2024-01-15T14:30:00.000Z';
      const gameTime = GameTime.fromISOString(isoString);
      
      expect(gameTime.toISOString()).toBe(isoString);
    });

    it('should throw error for invalid ISO string', () => {
      expect(() => GameTime.fromISOString('invalid-iso')).toThrow('GameTime must be a valid date');
    });
  });

  describe('edge cases', () => {
    it('should handle leap year dates', () => {
      const leapYearDate = '2024-02-29T12:00:00.000Z';
      const gameTime = new GameTime(leapYearDate);
      
      expect(gameTime.toISOString()).toBe(leapYearDate);
    });

    it('should handle timezone differences', () => {
      const utcString = '2024-01-15T14:30:00.000Z';
      const gameTime = new GameTime(utcString);
      
      expect(gameTime.toISOString()).toBe(utcString);
    });

    it('should handle millisecond precision', () => {
      const preciseDate = '2024-01-15T14:30:00.123Z';
      const gameTime = new GameTime(preciseDate);
      
      expect(gameTime.toISOString()).toBe(preciseDate);
    });
  });
});
