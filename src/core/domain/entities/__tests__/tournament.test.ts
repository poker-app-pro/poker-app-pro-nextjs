import { Tournament } from '../tournament';
import { GameTime } from '../../value-objects/game-time';

describe('Tournament Entity', () => {
  const validId = 'tournament-123';
  const validName = 'Test Tournament';
  const validSeriesId = 'series-123';
  const validSeasonId = 'season-123';
  const validDate = new GameTime(new Date('2024-06-15'));
  const validCreatedAt = GameTime.now();

  describe('Constructor', () => {
    it('should create a tournament with valid parameters', () => {
      const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt);

      expect(tournament.id).toBe(validId);
      expect(tournament.name).toBe(validName);
      expect(tournament.seriesId).toBe(validSeriesId);
      expect(tournament.seasonId).toBe(validSeasonId);
      expect(tournament.date).toBe(validDate);
      expect(tournament.createdAt).toBe(validCreatedAt);
      expect(tournament.isActive).toBe(true);
      expect(tournament.notes).toBeUndefined();
      expect(tournament.maxPlayers).toBeUndefined();
      expect(tournament.buyIn).toBeUndefined();
    });

    it('should create a tournament with optional parameters', () => {
      const notes = 'Test Notes';
      const maxPlayers = 50;
      const buyIn = 100;
      
      const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
        notes,
        maxPlayers,
        buyIn,
        isActive: false,
      });

      expect(tournament.notes).toBe(notes);
      expect(tournament.maxPlayers).toBe(maxPlayers);
      expect(tournament.buyIn).toBe(buyIn);
      expect(tournament.isActive).toBe(false);
    });

    it('should throw error for empty ID', () => {
      expect(() => {
        new Tournament('', validName, validSeriesId, validSeasonId, validDate, validCreatedAt);
      }).toThrow('Tournament ID cannot be empty');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        new Tournament(validId, '', validSeriesId, validSeasonId, validDate, validCreatedAt);
      }).toThrow('Tournament name cannot be empty');
    });

    it('should throw error for empty series ID', () => {
      expect(() => {
        new Tournament(validId, validName, '', validSeasonId, validDate, validCreatedAt);
      }).toThrow('Series ID cannot be empty');
    });

    it('should throw error for empty season ID', () => {
      expect(() => {
        new Tournament(validId, validName, validSeriesId, '', validDate, validCreatedAt);
      }).toThrow('Season ID cannot be empty');
    });

    it('should throw error for invalid max players', () => {
      expect(() => {
        new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          maxPlayers: 0,
        });
      }).toThrow('Max players must be greater than 0');

      expect(() => {
        new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          maxPlayers: -5,
        });
      }).toThrow('Max players must be greater than 0');
    });

    it('should throw error for negative buy-in', () => {
      expect(() => {
        new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          buyIn: -10,
        });
      }).toThrow('Buy-in cannot be negative');
    });

    it('should allow zero buy-in', () => {
      expect(() => {
        new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          buyIn: 0,
        });
      }).not.toThrow();
    });
  });

  describe('Business Methods', () => {
    let tournament: Tournament;

    beforeEach(() => {
      tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt);
    });

    describe('updateName', () => {
      it('should update the name successfully', () => {
        const newName = 'Updated Tournament';
        tournament.updateName(newName);
        expect(tournament.name).toBe(newName);
      });

      it('should throw error for empty name', () => {
        expect(() => {
          tournament.updateName('');
        }).toThrow('Tournament name cannot be empty');
      });

      it('should trim whitespace from new name', () => {
        tournament.updateName('  Updated Tournament  ');
        expect(tournament.name).toBe('Updated Tournament');
      });
    });

    describe('updateDate', () => {
      it('should update the date successfully', () => {
        const newDate = new GameTime(new Date('2024-07-15'));
        tournament.updateDate(newDate);
        expect(tournament.date).toBe(newDate);
      });
    });

    describe('updateNotes', () => {
      it('should update the notes successfully', () => {
        const newNotes = 'Updated Notes';
        tournament.updateNotes(newNotes);
        expect(tournament.notes).toBe(newNotes);
      });

      it('should clear notes when undefined', () => {
        tournament.updateNotes('Initial Notes');
        tournament.updateNotes(undefined);
        expect(tournament.notes).toBeUndefined();
      });

      it('should trim whitespace from notes', () => {
        tournament.updateNotes('  Updated Notes  ');
        expect(tournament.notes).toBe('Updated Notes');
      });
    });

    describe('updateMaxPlayers', () => {
      it('should update max players successfully', () => {
        tournament.updateMaxPlayers(100);
        expect(tournament.maxPlayers).toBe(100);
      });

      it('should clear max players when undefined', () => {
        tournament.updateMaxPlayers(50);
        tournament.updateMaxPlayers(undefined);
        expect(tournament.maxPlayers).toBeUndefined();
      });

      it('should throw error for invalid max players', () => {
        expect(() => {
          tournament.updateMaxPlayers(0);
        }).toThrow('Max players must be greater than 0');
      });
    });

    describe('updateBuyIn', () => {
      it('should update buy-in successfully', () => {
        tournament.updateBuyIn(50);
        expect(tournament.buyIn).toBe(50);
      });

      it('should clear buy-in when undefined', () => {
        tournament.updateBuyIn(25);
        tournament.updateBuyIn(undefined);
        expect(tournament.buyIn).toBeUndefined();
      });

      it('should allow zero buy-in', () => {
        tournament.updateBuyIn(0);
        expect(tournament.buyIn).toBe(0);
      });

      it('should throw error for negative buy-in', () => {
        expect(() => {
          tournament.updateBuyIn(-10);
        }).toThrow('Buy-in cannot be negative');
      });
    });

    describe('activate/deactivate', () => {
      it('should activate the tournament', () => {
        tournament.deactivate();
        expect(tournament.isActive).toBe(false);

        tournament.activate();
        expect(tournament.isActive).toBe(true);
      });

      it('should deactivate the tournament', () => {
        expect(tournament.isActive).toBe(true);

        tournament.deactivate();
        expect(tournament.isActive).toBe(false);
      });
    });
  });

  describe('Business Logic Methods', () => {
    describe('hasCompleted', () => {
      it('should return true for tournament in the past', () => {
        const pastDate = new GameTime(new Date(Date.now() - 86400000)); // Yesterday
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, pastDate, validCreatedAt);
        expect(tournament.hasCompleted()).toBe(true);
      });

      it('should return false for tournament in the future', () => {
        const futureDate = new GameTime(new Date(Date.now() + 86400000)); // Tomorrow
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, futureDate, validCreatedAt);
        expect(tournament.hasCompleted()).toBe(false);
      });
    });

    describe('isToday', () => {
      it('should return true for tournament today', () => {
        const today = new GameTime(new Date());
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, today, validCreatedAt);
        expect(tournament.isToday()).toBe(true);
      });

      it('should return false for tournament not today', () => {
        const tomorrow = new GameTime(new Date(Date.now() + 86400000));
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, tomorrow, validCreatedAt);
        expect(tournament.isToday()).toBe(false);
      });
    });

    describe('isUpcoming', () => {
      it('should return true for tournament in the future', () => {
        const futureDate = new GameTime(new Date(Date.now() + 86400000)); // Tomorrow
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, futureDate, validCreatedAt);
        expect(tournament.isUpcoming()).toBe(true);
      });

      it('should return false for tournament in the past', () => {
        const pastDate = new GameTime(new Date(Date.now() - 86400000)); // Yesterday
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, pastDate, validCreatedAt);
        expect(tournament.isUpcoming()).toBe(false);
      });
    });

    describe('canAcceptMorePlayers', () => {
      it('should return true when no max players set', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt);
        expect(tournament.canAcceptMorePlayers(50)).toBe(true);
      });

      it('should return true when current count is below max', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          maxPlayers: 100,
        });
        expect(tournament.canAcceptMorePlayers(50)).toBe(true);
      });

      it('should return false when current count equals max', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          maxPlayers: 50,
        });
        expect(tournament.canAcceptMorePlayers(50)).toBe(false);
      });

      it('should return false when current count exceeds max', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          maxPlayers: 50,
        });
        expect(tournament.canAcceptMorePlayers(60)).toBe(false);
      });
    });

    describe('isFull', () => {
      it('should return false when tournament can accept more players', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          maxPlayers: 100,
        });
        expect(tournament.isFull(50)).toBe(false);
      });

      it('should return true when tournament cannot accept more players', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          maxPlayers: 50,
        });
        expect(tournament.isFull(50)).toBe(true);
      });
    });

    describe('getDaysUntilTournament', () => {
      it('should return 0 for past tournament', () => {
        const pastDate = new GameTime(new Date(Date.now() - 86400000)); // Yesterday
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, pastDate, validCreatedAt);
        expect(tournament.getDaysUntilTournament()).toBe(0);
      });

      it('should return positive number for future tournament', () => {
        const futureDate = new GameTime(new Date(Date.now() + 86400000 * 5)); // 5 days from now
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, futureDate, validCreatedAt);
        expect(tournament.getDaysUntilTournament()).toBeGreaterThan(0);
      });
    });
  });

  describe('Notes Parsing Methods', () => {
    describe('getBountyPlayers', () => {
      it('should return empty array when no notes', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt);
        expect(tournament.getBountyPlayers()).toEqual([]);
      });

      it('should return empty array when no bounty section', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          notes: 'Some other notes',
        });
        expect(tournament.getBountyPlayers()).toEqual([]);
      });

      it('should parse bounty players correctly', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          notes: 'Bounty players: John Doe, Jane Smith, Bob Johnson\nOther notes',
        });
        expect(tournament.getBountyPlayers()).toEqual(['John Doe', 'Jane Smith', 'Bob Johnson']);
      });

      it('should handle empty bounty section', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          notes: 'Bounty players: \nOther notes',
        });
        expect(tournament.getBountyPlayers()).toEqual([]);
      });
    });

    describe('getConsolationPlayers', () => {
      it('should return empty array when no notes', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt);
        expect(tournament.getConsolationPlayers()).toEqual([]);
      });

      it('should parse consolation players correctly', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          notes: 'Consolation players: Alice Brown, Charlie Wilson\nOther notes',
        });
        expect(tournament.getConsolationPlayers()).toEqual(['Alice Brown', 'Charlie Wilson']);
      });
    });

    describe('isBountyPlayer', () => {
      it('should return true for bounty player', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          notes: 'Bounty players: John Doe, Jane Smith',
        });
        expect(tournament.isBountyPlayer('John Doe')).toBe(true);
      });

      it('should return false for non-bounty player', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          notes: 'Bounty players: John Doe, Jane Smith',
        });
        expect(tournament.isBountyPlayer('Bob Johnson')).toBe(false);
      });
    });

    describe('isConsolationPlayer', () => {
      it('should return true for consolation player', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          notes: 'Consolation players: Alice Brown, Charlie Wilson',
        });
        expect(tournament.isConsolationPlayer('Alice Brown')).toBe(true);
      });

      it('should return false for non-consolation player', () => {
        const tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt, {
          notes: 'Consolation players: Alice Brown, Charlie Wilson',
        });
        expect(tournament.isConsolationPlayer('John Doe')).toBe(false);
      });
    });
  });

  describe('Static Methods', () => {
    describe('create', () => {
      it('should create a tournament with default values', () => {
        const tournament = Tournament.create(validId, validName, validSeriesId, validSeasonId, validDate);

        expect(tournament.id).toBe(validId);
        expect(tournament.name).toBe(validName);
        expect(tournament.seriesId).toBe(validSeriesId);
        expect(tournament.seasonId).toBe(validSeasonId);
        expect(tournament.date).toBe(validDate);
        expect(tournament.isActive).toBe(true);
        expect(tournament.notes).toBeUndefined();
      });

      it('should create a tournament with custom options', () => {
        const notes = 'Custom Notes';
        const maxPlayers = 75;
        const buyIn = 25;
        const customCreatedAt = new GameTime(new Date('2023-01-01'));
        
        const tournament = Tournament.create(validId, validName, validSeriesId, validSeasonId, validDate, {
          notes,
          maxPlayers,
          buyIn,
          isActive: false,
          createdAt: customCreatedAt,
        });

        expect(tournament.notes).toBe(notes);
        expect(tournament.maxPlayers).toBe(maxPlayers);
        expect(tournament.buyIn).toBe(buyIn);
        expect(tournament.isActive).toBe(false);
        expect(tournament.createdAt).toBe(customCreatedAt);
      });
    });
  });

  describe('Utility Methods', () => {
    let tournament: Tournament;

    beforeEach(() => {
      tournament = new Tournament(validId, validName, validSeriesId, validSeasonId, validDate, validCreatedAt);
    });

    describe('equals', () => {
      it('should return true for same tournament', () => {
        const otherTournament = new Tournament(validId, 'Different Name', 'different-series', 'different-season', validDate, validCreatedAt);
        expect(tournament.equals(otherTournament)).toBe(true);
      });

      it('should return false for different tournament', () => {
        const otherTournament = new Tournament('different-id', validName, validSeriesId, validSeasonId, validDate, validCreatedAt);
        expect(tournament.equals(otherTournament)).toBe(false);
      });
    });

    describe('toString', () => {
      it('should return string representation', () => {
        const result = tournament.toString();
        expect(result).toBe(`Tournament(${validId}, ${validName})`);
      });
    });
  });
});
