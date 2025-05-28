import { Season } from '../season';
import { GameTime } from '../../value-objects/game-time';

describe('Season Entity', () => {
  const validId = 'season-123';
  const validName = 'Test Season';
  const validLeagueId = 'league-123';
  const validStartDate = new GameTime(new Date('2024-01-01'));
  const validEndDate = new GameTime(new Date('2024-12-31'));
  const validCreatedAt = GameTime.now();

  describe('Constructor', () => {
    it('should create a season with valid parameters', () => {
      const season = new Season(validId, validName, validLeagueId, validStartDate, validEndDate, validCreatedAt);

      expect(season.id).toBe(validId);
      expect(season.name).toBe(validName);
      expect(season.leagueId).toBe(validLeagueId);
      expect(season.startDate).toBe(validStartDate);
      expect(season.endDate).toBe(validEndDate);
      expect(season.createdAt).toBe(validCreatedAt);
      expect(season.isActive).toBe(true);
      expect(season.description).toBeUndefined();
    });

    it('should create a season with optional parameters', () => {
      const description = 'Test Description';
      const season = new Season(validId, validName, validLeagueId, validStartDate, validEndDate, validCreatedAt, {
        description,
        isActive: false,
      });

      expect(season.description).toBe(description);
      expect(season.isActive).toBe(false);
    });

    it('should throw error for empty ID', () => {
      expect(() => {
        new Season('', validName, validLeagueId, validStartDate, validEndDate, validCreatedAt);
      }).toThrow('Season ID cannot be empty');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        new Season(validId, '', validLeagueId, validStartDate, validEndDate, validCreatedAt);
      }).toThrow('Season name cannot be empty');
    });

    it('should throw error for empty league ID', () => {
      expect(() => {
        new Season(validId, validName, '', validStartDate, validEndDate, validCreatedAt);
      }).toThrow('League ID cannot be empty');
    });

    it('should throw error when start date is after end date', () => {
      const laterStartDate = new GameTime(new Date('2024-12-31'));
      const earlierEndDate = new GameTime(new Date('2024-01-01'));

      expect(() => {
        new Season(validId, validName, validLeagueId, laterStartDate, earlierEndDate, validCreatedAt);
      }).toThrow('Season start date cannot be after end date');
    });

    it('should allow start date equal to end date', () => {
      const sameDate = new GameTime(new Date('2024-06-15'));
      
      expect(() => {
        new Season(validId, validName, validLeagueId, sameDate, sameDate, validCreatedAt);
      }).not.toThrow();
    });
  });

  describe('Business Methods', () => {
    let season: Season;

    beforeEach(() => {
      season = new Season(validId, validName, validLeagueId, validStartDate, validEndDate, validCreatedAt);
    });

    describe('updateName', () => {
      it('should update the name successfully', () => {
        const newName = 'Updated Season';
        season.updateName(newName);
        expect(season.name).toBe(newName);
      });

      it('should throw error for empty name', () => {
        expect(() => {
          season.updateName('');
        }).toThrow('Season name cannot be empty');
      });

      it('should trim whitespace from new name', () => {
        season.updateName('  Updated Season  ');
        expect(season.name).toBe('Updated Season');
      });
    });

    describe('updateDescription', () => {
      it('should update the description successfully', () => {
        const newDescription = 'Updated Description';
        season.updateDescription(newDescription);
        expect(season.description).toBe(newDescription);
      });

      it('should clear description when undefined', () => {
        season.updateDescription('Initial Description');
        season.updateDescription(undefined);
        expect(season.description).toBeUndefined();
      });
    });

    describe('updateDates', () => {
      it('should update dates successfully', () => {
        const newStartDate = new GameTime(new Date('2024-02-01'));
        const newEndDate = new GameTime(new Date('2024-11-30'));
        
        season.updateDates(newStartDate, newEndDate);
        expect(season.startDate).toBe(newStartDate);
        expect(season.endDate).toBe(newEndDate);
      });

      it('should throw error when new start date is after new end date', () => {
        const laterStartDate = new GameTime(new Date('2024-12-31'));
        const earlierEndDate = new GameTime(new Date('2024-01-01'));

        expect(() => {
          season.updateDates(laterStartDate, earlierEndDate);
        }).toThrow('Season start date cannot be after end date');
      });
    });

    describe('activate/deactivate', () => {
      it('should activate the season', () => {
        season.deactivate();
        expect(season.isActive).toBe(false);

        season.activate();
        expect(season.isActive).toBe(true);
      });

      it('should deactivate the season', () => {
        expect(season.isActive).toBe(true);

        season.deactivate();
        expect(season.isActive).toBe(false);
      });
    });
  });

  describe('Business Logic Methods', () => {
    describe('isCurrentlyActive', () => {
      it('should return true for active season within date range', () => {
        const now = new Date();
        const startDate = new GameTime(new Date(now.getTime() - 86400000)); // Yesterday
        const endDate = new GameTime(new Date(now.getTime() + 86400000)); // Tomorrow
        
        const season = new Season(validId, validName, validLeagueId, startDate, endDate, validCreatedAt);
        expect(season.isCurrentlyActive()).toBe(true);
      });

      it('should return false for inactive season', () => {
        const now = new Date();
        const startDate = new GameTime(new Date(now.getTime() - 86400000)); // Yesterday
        const endDate = new GameTime(new Date(now.getTime() + 86400000)); // Tomorrow
        
        const season = new Season(validId, validName, validLeagueId, startDate, endDate, validCreatedAt, {
          isActive: false,
        });
        expect(season.isCurrentlyActive()).toBe(false);
      });

      it('should return false for season not yet started', () => {
        const now = new Date();
        const startDate = new GameTime(new Date(now.getTime() + 86400000)); // Tomorrow
        const endDate = new GameTime(new Date(now.getTime() + 172800000)); // Day after tomorrow
        
        const season = new Season(validId, validName, validLeagueId, startDate, endDate, validCreatedAt);
        expect(season.isCurrentlyActive()).toBe(false);
      });

      it('should return false for season that has ended', () => {
        const now = new Date();
        const startDate = new GameTime(new Date(now.getTime() - 172800000)); // Day before yesterday
        const endDate = new GameTime(new Date(now.getTime() - 86400000)); // Yesterday
        
        const season = new Season(validId, validName, validLeagueId, startDate, endDate, validCreatedAt);
        expect(season.isCurrentlyActive()).toBe(false);
      });
    });

    describe('hasStarted', () => {
      it('should return true for season that has started', () => {
        const now = new Date();
        const startDate = new GameTime(new Date(now.getTime() - 86400000)); // Yesterday
        const endDate = new GameTime(new Date(now.getTime() + 86400000)); // Tomorrow
        
        const season = new Season(validId, validName, validLeagueId, startDate, endDate, validCreatedAt);
        expect(season.hasStarted()).toBe(true);
      });

      it('should return false for season that has not started', () => {
        const now = new Date();
        const startDate = new GameTime(new Date(now.getTime() + 86400000)); // Tomorrow
        const endDate = new GameTime(new Date(now.getTime() + 172800000)); // Day after tomorrow
        
        const season = new Season(validId, validName, validLeagueId, startDate, endDate, validCreatedAt);
        expect(season.hasStarted()).toBe(false);
      });
    });

    describe('hasEnded', () => {
      it('should return true for season that has ended', () => {
        const now = new Date();
        const startDate = new GameTime(new Date(now.getTime() - 172800000)); // Day before yesterday
        const endDate = new GameTime(new Date(now.getTime() - 86400000)); // Yesterday
        
        const season = new Season(validId, validName, validLeagueId, startDate, endDate, validCreatedAt);
        expect(season.hasEnded()).toBe(true);
      });

      it('should return false for season that has not ended', () => {
        const now = new Date();
        const startDate = new GameTime(new Date(now.getTime() - 86400000)); // Yesterday
        const endDate = new GameTime(new Date(now.getTime() + 86400000)); // Tomorrow
        
        const season = new Season(validId, validName, validLeagueId, startDate, endDate, validCreatedAt);
        expect(season.hasEnded()).toBe(false);
      });
    });

    describe('getDurationInDays', () => {
      it('should calculate duration correctly', () => {
        const startDate = new GameTime(new Date('2024-01-01'));
        const endDate = new GameTime(new Date('2024-01-31'));
        
        const season = new Season(validId, validName, validLeagueId, startDate, endDate, validCreatedAt);
        expect(season.getDurationInDays()).toBe(30);
      });
    });

    describe('containsDate', () => {
      let season: Season;

      beforeEach(() => {
        const startDate = new GameTime(new Date('2024-01-01'));
        const endDate = new GameTime(new Date('2024-12-31'));
        season = new Season(validId, validName, validLeagueId, startDate, endDate, validCreatedAt);
      });

      it('should return true for date within season', () => {
        const dateInSeason = new GameTime(new Date('2024-06-15'));
        expect(season.containsDate(dateInSeason)).toBe(true);
      });

      it('should return true for start date', () => {
        const startDate = new GameTime(new Date('2024-01-01'));
        expect(season.containsDate(startDate)).toBe(true);
      });

      it('should return true for end date', () => {
        const endDate = new GameTime(new Date('2024-12-31'));
        expect(season.containsDate(endDate)).toBe(true);
      });

      it('should return false for date before season', () => {
        const dateBeforeSeason = new GameTime(new Date('2023-12-31'));
        expect(season.containsDate(dateBeforeSeason)).toBe(false);
      });

      it('should return false for date after season', () => {
        const dateAfterSeason = new GameTime(new Date('2025-01-01'));
        expect(season.containsDate(dateAfterSeason)).toBe(false);
      });
    });
  });

  describe('Static Methods', () => {
    describe('create', () => {
      it('should create a season with default values', () => {
        const season = Season.create(validId, validName, validLeagueId, validStartDate, validEndDate);

        expect(season.id).toBe(validId);
        expect(season.name).toBe(validName);
        expect(season.leagueId).toBe(validLeagueId);
        expect(season.startDate).toBe(validStartDate);
        expect(season.endDate).toBe(validEndDate);
        expect(season.isActive).toBe(true);
        expect(season.description).toBeUndefined();
      });

      it('should create a season with custom options', () => {
        const description = 'Custom Description';
        const customCreatedAt = new GameTime(new Date('2023-01-01'));
        
        const season = Season.create(validId, validName, validLeagueId, validStartDate, validEndDate, {
          description,
          isActive: false,
          createdAt: customCreatedAt,
        });

        expect(season.description).toBe(description);
        expect(season.isActive).toBe(false);
        expect(season.createdAt).toBe(customCreatedAt);
      });
    });
  });

  describe('Utility Methods', () => {
    let season: Season;

    beforeEach(() => {
      season = new Season(validId, validName, validLeagueId, validStartDate, validEndDate, validCreatedAt);
    });

    describe('equals', () => {
      it('should return true for same season', () => {
        const otherSeason = new Season(validId, 'Different Name', 'different-league', validStartDate, validEndDate, validCreatedAt);
        expect(season.equals(otherSeason)).toBe(true);
      });

      it('should return false for different season', () => {
        const otherSeason = new Season('different-id', validName, validLeagueId, validStartDate, validEndDate, validCreatedAt);
        expect(season.equals(otherSeason)).toBe(false);
      });
    });

    describe('toString', () => {
      it('should return string representation', () => {
        const result = season.toString();
        expect(result).toBe(`Season(${validId}, ${validName})`);
      });
    });
  });
});
