import { Scoreboard } from '../scoreboard';
import { GameTime } from '../../value-objects/game-time';
import { Points } from '../../value-objects/points';

describe('Scoreboard Entity', () => {
  const validId = 'scoreboard-123';
  const validPlayerId = 'player-123';
  const validSeriesId = 'series-123';
  const validSeasonId = 'season-123';
  const validCreatedAt = GameTime.now();

  describe('Constructor', () => {
    it('should create a scoreboard with valid parameters', () => {
      const scoreboard = new Scoreboard(validId, validPlayerId, validSeriesId, validSeasonId, validCreatedAt);

      expect(scoreboard.id).toBe(validId);
      expect(scoreboard.playerId).toBe(validPlayerId);
      expect(scoreboard.seriesId).toBe(validSeriesId);
      expect(scoreboard.seasonId).toBe(validSeasonId);
      expect(scoreboard.createdAt).toBe(validCreatedAt);
      expect(scoreboard.tournamentCount).toBe(0);
      expect(scoreboard.bestFinish).toBe(0);
      expect(scoreboard.totalPoints.value).toBe(0);
    });

    it('should create a scoreboard with optional parameters', () => {
      const tournamentCount = 5;
      const bestFinish = 2;
      const totalPoints = new Points(150);
      
      const scoreboard = new Scoreboard(validId, validPlayerId, validSeriesId, validSeasonId, validCreatedAt, {
        tournamentCount,
        bestFinish,
        totalPoints,
      });

      expect(scoreboard.tournamentCount).toBe(tournamentCount);
      expect(scoreboard.bestFinish).toBe(bestFinish);
      expect(scoreboard.totalPoints).toBe(totalPoints);
    });

    it('should throw error for empty ID', () => {
      expect(() => {
        new Scoreboard('', validPlayerId, validSeriesId, validSeasonId, validCreatedAt);
      }).toThrow('Scoreboard ID cannot be empty');
    });

    it('should throw error for empty player ID', () => {
      expect(() => {
        new Scoreboard(validId, '', validSeriesId, validSeasonId, validCreatedAt);
      }).toThrow('Player ID cannot be empty');
    });

    it('should throw error for empty series ID', () => {
      expect(() => {
        new Scoreboard(validId, validPlayerId, '', validSeasonId, validCreatedAt);
      }).toThrow('Series ID cannot be empty');
    });

    it('should throw error for empty season ID', () => {
      expect(() => {
        new Scoreboard(validId, validPlayerId, validSeriesId, '', validCreatedAt);
      }).toThrow('Season ID cannot be empty');
    });

    it('should throw error for negative tournament count', () => {
      expect(() => {
        new Scoreboard(validId, validPlayerId, validSeriesId, validSeasonId, validCreatedAt, {
          tournamentCount: -1,
        });
      }).toThrow('Tournament count cannot be negative');
    });

    it('should throw error for invalid best finish', () => {
      expect(() => {
        new Scoreboard(validId, validPlayerId, validSeriesId, validSeasonId, validCreatedAt, {
          bestFinish: -1,
        });
      }).toThrow('Best finish cannot be negative');
    });
  });

  describe('Business Methods', () => {
    let scoreboard: Scoreboard;

    beforeEach(() => {
      scoreboard = new Scoreboard(validId, validPlayerId, validSeriesId, validSeasonId, validCreatedAt);
    });

    describe('addTournamentResult', () => {
      it('should add tournament result successfully', () => {
        const finalPosition = 3;
        const points = new Points(50);

        scoreboard.addTournamentResult(finalPosition, points);

        expect(scoreboard.tournamentCount).toBe(1);
        expect(scoreboard.totalPoints.value).toBe(50);
        expect(scoreboard.bestFinish).toBe(3);
      });

      it('should update best finish when better position achieved', () => {
        scoreboard.addTournamentResult(5, new Points(30));
        expect(scoreboard.bestFinish).toBe(5);

        scoreboard.addTournamentResult(2, new Points(70));
        expect(scoreboard.bestFinish).toBe(2);
      });

      it('should not update best finish when worse position achieved', () => {
        scoreboard.addTournamentResult(2, new Points(70));
        expect(scoreboard.bestFinish).toBe(2);

        scoreboard.addTournamentResult(5, new Points(30));
        expect(scoreboard.bestFinish).toBe(2);
      });

      it('should accumulate points correctly', () => {
        scoreboard.addTournamentResult(3, new Points(50));
        scoreboard.addTournamentResult(1, new Points(100));
        scoreboard.addTournamentResult(8, new Points(20));

        expect(scoreboard.totalPoints.value).toBe(170);
        expect(scoreboard.tournamentCount).toBe(3);
      });

      it('should throw error for invalid final position', () => {
        expect(() => {
          scoreboard.addTournamentResult(0, new Points(50));
        }).toThrow('Final position must be greater than 0');

        expect(() => {
          scoreboard.addTournamentResult(-1, new Points(50));
        }).toThrow('Final position must be greater than 0');
      });
    });

    describe('removeTournamentResult', () => {
      beforeEach(() => {
        scoreboard.addTournamentResult(3, new Points(50));
        scoreboard.addTournamentResult(1, new Points(100));
      });

      it('should remove tournament result successfully', () => {
        scoreboard.removeTournamentResult(3, new Points(50));

        expect(scoreboard.tournamentCount).toBe(1);
        expect(scoreboard.totalPoints.value).toBe(100);
      });

      it('should throw error when no tournaments to remove', () => {
        const emptyScoreboard = new Scoreboard(validId, validPlayerId, validSeriesId, validSeasonId, validCreatedAt);
        
        expect(() => {
          emptyScoreboard.removeTournamentResult(1, new Points(50));
        }).toThrow('Cannot remove tournament result: no tournaments recorded');
      });

      it('should throw error for invalid final position', () => {
        expect(() => {
          scoreboard.removeTournamentResult(0, new Points(50));
        }).toThrow('Final position must be greater than 0');
      });
    });

    describe('updateBestFinish', () => {
      it('should update best finish successfully', () => {
        scoreboard.updateBestFinish(1);
        expect(scoreboard.bestFinish).toBe(1);
      });

      it('should throw error for invalid best finish', () => {
        expect(() => {
          scoreboard.updateBestFinish(0);
        }).toThrow('Best finish must be greater than 0');
      });
    });

    describe('resetBestFinish', () => {
      it('should reset best finish to 0', () => {
        scoreboard.addTournamentResult(3, new Points(50));
        expect(scoreboard.bestFinish).toBe(3);

        scoreboard.resetBestFinish();
        expect(scoreboard.bestFinish).toBe(0);
      });
    });

    describe('recalculate', () => {
      it('should recalculate scoreboard from tournament results', () => {
        const results = [
          { finalPosition: 3, points: new Points(50) },
          { finalPosition: 1, points: new Points(100) },
          { finalPosition: 8, points: new Points(20) },
        ];

        scoreboard.recalculate(results);

        expect(scoreboard.tournamentCount).toBe(3);
        expect(scoreboard.totalPoints.value).toBe(170);
        expect(scoreboard.bestFinish).toBe(1);
      });

      it('should handle empty results array', () => {
        scoreboard.addTournamentResult(1, new Points(100));
        scoreboard.recalculate([]);

        expect(scoreboard.tournamentCount).toBe(0);
        expect(scoreboard.totalPoints.value).toBe(0);
        expect(scoreboard.bestFinish).toBe(0);
      });
    });
  });

  describe('Query Methods', () => {
    let scoreboard: Scoreboard;

    beforeEach(() => {
      scoreboard = new Scoreboard(validId, validPlayerId, validSeriesId, validSeasonId, validCreatedAt);
    });

    describe('getAveragePointsPerTournament', () => {
      it('should return 0 for no tournaments', () => {
        expect(scoreboard.getAveragePointsPerTournament()).toBe(0);
      });

      it('should calculate average correctly', () => {
        scoreboard.addTournamentResult(1, new Points(100));
        scoreboard.addTournamentResult(3, new Points(50));
        
        expect(scoreboard.getAveragePointsPerTournament()).toBe(75);
      });
    });

    describe('hasPlayedTournaments', () => {
      it('should return false for no tournaments', () => {
        expect(scoreboard.hasPlayedTournaments()).toBe(false);
      });

      it('should return true after playing tournaments', () => {
        scoreboard.addTournamentResult(1, new Points(100));
        expect(scoreboard.hasPlayedTournaments()).toBe(true);
      });
    });

    describe('hasWonTournament', () => {
      it('should return false when no first place finish', () => {
        scoreboard.addTournamentResult(2, new Points(80));
        expect(scoreboard.hasWonTournament()).toBe(false);
      });

      it('should return true when has first place finish', () => {
        scoreboard.addTournamentResult(1, new Points(100));
        expect(scoreboard.hasWonTournament()).toBe(true);
      });

      it('should return false when no tournaments played', () => {
        expect(scoreboard.hasWonTournament()).toBe(false);
      });
    });

    describe('hasMadeFinalTable', () => {
      it('should return false when no tournaments played', () => {
        expect(scoreboard.hasMadeFinalTable()).toBe(false);
      });

      it('should return true for positions 1-8', () => {
        for (let position = 1; position <= 8; position++) {
          const testScoreboard = new Scoreboard(validId, validPlayerId, validSeriesId, validSeasonId, validCreatedAt);
          testScoreboard.addTournamentResult(position, new Points(50));
          expect(testScoreboard.hasMadeFinalTable()).toBe(true);
        }
      });

      it('should return false for positions 9 and higher', () => {
        scoreboard.addTournamentResult(9, new Points(30));
        expect(scoreboard.hasMadeFinalTable()).toBe(false);
      });
    });

    describe('getPointsEfficiency', () => {
      it('should return same as average points per tournament', () => {
        scoreboard.addTournamentResult(1, new Points(100));
        scoreboard.addTournamentResult(3, new Points(50));
        
        expect(scoreboard.getPointsEfficiency()).toBe(scoreboard.getAveragePointsPerTournament());
      });
    });
  });

  describe('Comparison Methods', () => {
    describe('compareForRanking', () => {
      it('should rank by total points first', () => {
        const scoreboard1 = new Scoreboard('sb1', 'p1', validSeriesId, validSeasonId, validCreatedAt);
        const scoreboard2 = new Scoreboard('sb2', 'p2', validSeriesId, validSeasonId, validCreatedAt);

        scoreboard1.addTournamentResult(1, new Points(100));
        scoreboard2.addTournamentResult(1, new Points(150));

        expect(scoreboard1.compareForRanking(scoreboard2)).toBeGreaterThan(0);
        expect(scoreboard2.compareForRanking(scoreboard1)).toBeLessThan(0);
      });

      it('should rank by best finish when points are equal', () => {
        const scoreboard1 = new Scoreboard('sb1', 'p1', validSeriesId, validSeasonId, validCreatedAt);
        const scoreboard2 = new Scoreboard('sb2', 'p2', validSeriesId, validSeasonId, validCreatedAt);

        scoreboard1.addTournamentResult(3, new Points(100));
        scoreboard2.addTournamentResult(1, new Points(100));

        expect(scoreboard1.compareForRanking(scoreboard2)).toBeGreaterThan(0);
        expect(scoreboard2.compareForRanking(scoreboard1)).toBeLessThan(0);
      });

      it('should rank by tournament count when points and best finish are equal', () => {
        const scoreboard1 = new Scoreboard('sb1', 'p1', validSeriesId, validSeasonId, validCreatedAt);
        const scoreboard2 = new Scoreboard('sb2', 'p2', validSeriesId, validSeasonId, validCreatedAt);

        scoreboard1.addTournamentResult(1, new Points(100));
        
        scoreboard2.addTournamentResult(1, new Points(50));
        scoreboard2.addTournamentResult(2, new Points(50));

        expect(scoreboard1.compareForRanking(scoreboard2)).toBeGreaterThan(0);
        expect(scoreboard2.compareForRanking(scoreboard1)).toBeLessThan(0);
      });

      it('should return 0 for identical scoreboards', () => {
        const scoreboard1 = new Scoreboard('sb1', 'p1', validSeriesId, validSeasonId, validCreatedAt);
        const scoreboard2 = new Scoreboard('sb2', 'p2', validSeriesId, validSeasonId, validCreatedAt);

        scoreboard1.addTournamentResult(1, new Points(100));
        scoreboard2.addTournamentResult(1, new Points(100));

        expect(scoreboard1.compareForRanking(scoreboard2)).toBe(0);
      });
    });
  });

  describe('Static Methods', () => {
    describe('create', () => {
      it('should create a scoreboard with default values', () => {
        const scoreboard = Scoreboard.create(validId, validPlayerId, validSeriesId, validSeasonId);

        expect(scoreboard.id).toBe(validId);
        expect(scoreboard.playerId).toBe(validPlayerId);
        expect(scoreboard.seriesId).toBe(validSeriesId);
        expect(scoreboard.seasonId).toBe(validSeasonId);
        expect(scoreboard.tournamentCount).toBe(0);
        expect(scoreboard.bestFinish).toBe(0);
        expect(scoreboard.totalPoints.value).toBe(0);
      });

      it('should create a scoreboard with custom options', () => {
        const tournamentCount = 3;
        const bestFinish = 2;
        const totalPoints = new Points(120);
        const customCreatedAt = new GameTime(new Date('2023-01-01'));
        
        const scoreboard = Scoreboard.create(validId, validPlayerId, validSeriesId, validSeasonId, {
          tournamentCount,
          bestFinish,
          totalPoints,
          createdAt: customCreatedAt,
        });

        expect(scoreboard.tournamentCount).toBe(tournamentCount);
        expect(scoreboard.bestFinish).toBe(bestFinish);
        expect(scoreboard.totalPoints).toBe(totalPoints);
        expect(scoreboard.createdAt).toBe(customCreatedAt);
      });
    });

    describe('createEmpty', () => {
      it('should create an empty scoreboard', () => {
        const scoreboard = Scoreboard.createEmpty(validId, validPlayerId, validSeriesId, validSeasonId);

        expect(scoreboard.tournamentCount).toBe(0);
        expect(scoreboard.bestFinish).toBe(0);
        expect(scoreboard.totalPoints.value).toBe(0);
      });

      it('should create an empty scoreboard with custom created date', () => {
        const customCreatedAt = new GameTime(new Date('2023-01-01'));
        const scoreboard = Scoreboard.createEmpty(validId, validPlayerId, validSeriesId, validSeasonId, customCreatedAt);

        expect(scoreboard.createdAt).toBe(customCreatedAt);
      });
    });
  });

  describe('Utility Methods', () => {
    let scoreboard: Scoreboard;

    beforeEach(() => {
      scoreboard = new Scoreboard(validId, validPlayerId, validSeriesId, validSeasonId, validCreatedAt);
    });

    describe('equals', () => {
      it('should return true for same scoreboard', () => {
        const otherScoreboard = new Scoreboard(validId, 'different-player', 'different-series', 'different-season', validCreatedAt);
        expect(scoreboard.equals(otherScoreboard)).toBe(true);
      });

      it('should return false for different scoreboard', () => {
        const otherScoreboard = new Scoreboard('different-id', validPlayerId, validSeriesId, validSeasonId, validCreatedAt);
        expect(scoreboard.equals(otherScoreboard)).toBe(false);
      });
    });

    describe('toString', () => {
      it('should return string representation', () => {
        const result = scoreboard.toString();
        expect(result).toBe(`Scoreboard(${validId}, ${validPlayerId}, 0 pts)`);
      });

      it('should show correct points in string representation', () => {
        scoreboard.addTournamentResult(1, new Points(100));
        const result = scoreboard.toString();
        expect(result).toBe(`Scoreboard(${validId}, ${validPlayerId}, 100 pts)`);
      });
    });
  });
});
