import { League } from '../league';
import { GameTime } from '@/src/core/domain/value-objects/game-time';

describe('League Entity', () => {
  const validId = 'league-123';
  const validName = 'Test League';
  const validOwnerId = 'owner-123';
  const validCreatedAt = GameTime.now();

  describe('Constructor', () => {
    it('should create a league with valid parameters', () => {
      const league = new League(validId, validName, validOwnerId, validCreatedAt);

      expect(league.id).toBe(validId);
      expect(league.name).toBe(validName);
      expect(league.ownerId).toBe(validOwnerId);
      expect(league.createdAt).toBe(validCreatedAt);
      expect(league.isActive).toBe(true);
      expect(league.description).toBeUndefined();
    });

    it('should create a league with optional parameters', () => {
      const description = 'Test Description';
      const league = new League(validId, validName, validOwnerId, validCreatedAt, {
        description,
        isActive: false,
      });

      expect(league.description).toBe(description);
      expect(league.isActive).toBe(false);
    });

    it('should throw error for empty ID', () => {
      expect(() => {
        new League('', validName, validOwnerId, validCreatedAt);
      }).toThrow('League ID cannot be empty');
    });

    it('should throw error for whitespace-only ID', () => {
      expect(() => {
        new League('   ', validName, validOwnerId, validCreatedAt);
      }).toThrow('League ID cannot be empty');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        new League(validId, '', validOwnerId, validCreatedAt);
      }).toThrow('League name cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => {
        new League(validId, '   ', validOwnerId, validCreatedAt);
      }).toThrow('League name cannot be empty');
    });

    it('should throw error for empty owner ID', () => {
      expect(() => {
        new League(validId, validName, '', validCreatedAt);
      }).toThrow('League owner ID cannot be empty');
    });

    it('should trim whitespace from name and description', () => {
      const league = new League(validId, '  Test League  ', validOwnerId, validCreatedAt, {
        description: '  Test Description  ',
      });

      expect(league.name).toBe('Test League');
      expect(league.description).toBe('Test Description');
    });
  });

  describe('Business Methods', () => {
    let league: League;

    beforeEach(() => {
      league = new League(validId, validName, validOwnerId, validCreatedAt);
    });

    describe('updateName', () => {
      it('should update the name successfully', () => {
        const newName = 'Updated League';
        const originalUpdatedAt = league.updatedAt;

        // Wait a bit to ensure timestamp changes
        setTimeout(() => {
          league.updateName(newName);
          expect(league.name).toBe(newName);
          expect(league.updatedAt.isAfter(originalUpdatedAt)).toBe(true);
        }, 1);
      });

      it('should throw error for empty name', () => {
        expect(() => {
          league.updateName('');
        }).toThrow('League name cannot be empty');
      });

      it('should trim whitespace from new name', () => {
        league.updateName('  Updated League  ');
        expect(league.name).toBe('Updated League');
      });
    });

    describe('updateDescription', () => {
      it('should update the description successfully', () => {
        const newDescription = 'Updated Description';
        league.updateDescription(newDescription);
        expect(league.description).toBe(newDescription);
      });

      it('should clear description when undefined', () => {
        league.updateDescription('Initial Description');
        league.updateDescription(undefined);
        expect(league.description).toBeUndefined();
      });

      it('should trim whitespace from description', () => {
        league.updateDescription('  Updated Description  ');
        expect(league.description).toBe('Updated Description');
      });
    });

    describe('activate/deactivate', () => {
      it('should activate the league', () => {
        league.deactivate();
        expect(league.isActive).toBe(false);

        league.activate();
        expect(league.isActive).toBe(true);
      });

      it('should deactivate the league', () => {
        expect(league.isActive).toBe(true);

        league.deactivate();
        expect(league.isActive).toBe(false);
      });
    });

    describe('isOwnedBy', () => {
      it('should return true for correct owner', () => {
        expect(league.isOwnedBy(validOwnerId)).toBe(true);
      });

      it('should return false for incorrect owner', () => {
        expect(league.isOwnedBy('different-owner')).toBe(false);
      });
    });

    describe('transferOwnership', () => {
      it('should transfer ownership successfully', () => {
        const newOwnerId = 'new-owner-123';
        league.transferOwnership(newOwnerId);
        expect(league.ownerId).toBe(newOwnerId);
      });

      it('should throw error for empty new owner ID', () => {
        expect(() => {
          league.transferOwnership('');
        }).toThrow('New owner ID cannot be empty');
      });
    });
  });

  describe('Static Methods', () => {
    describe('create', () => {
      it('should create a league with default values', () => {
        const league = League.create(validId, validName, validOwnerId);

        expect(league.id).toBe(validId);
        expect(league.name).toBe(validName);
        expect(league.ownerId).toBe(validOwnerId);
        expect(league.isActive).toBe(true);
        expect(league.description).toBeUndefined();
      });

      it('should create a league with custom options', () => {
        const description = 'Custom Description';
        const customCreatedAt = new GameTime(new Date('2023-01-01'));
        
        const league = League.create(validId, validName, validOwnerId, {
          description,
          isActive: false,
          createdAt: customCreatedAt,
        });

        expect(league.description).toBe(description);
        expect(league.isActive).toBe(false);
        expect(league.createdAt).toBe(customCreatedAt);
      });
    });
  });

  describe('Utility Methods', () => {
    let league: League;

    beforeEach(() => {
      league = new League(validId, validName, validOwnerId, validCreatedAt);
    });

    describe('equals', () => {
      it('should return true for same league', () => {
        const otherLeague = new League(validId, 'Different Name', 'different-owner', validCreatedAt);
        expect(league.equals(otherLeague)).toBe(true);
      });

      it('should return false for different league', () => {
        const otherLeague = new League('different-id', validName, validOwnerId, validCreatedAt);
        expect(league.equals(otherLeague)).toBe(false);
      });
    });

    describe('toString', () => {
      it('should return string representation', () => {
        const result = league.toString();
        expect(result).toBe(`League(${validId}, ${validName})`);
      });
    });
  });
});
