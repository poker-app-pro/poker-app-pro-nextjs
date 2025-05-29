import { GetPlayerProfileUseCase } from '../get-player-profile.use-case';
import { IPlayerRepository, PlayerProfile } from '../@/src/core/domain/repositories/player.repository';

describe('GetPlayerProfileUseCase', () => {
  let useCase: GetPlayerProfileUseCase;
  let mockPlayerRepository: jest.Mocked<IPlayerRepository>;

  beforeEach(() => {
    mockPlayerRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      findAllActive: jest.fn(),
      exists: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      getPlayerProfile: jest.fn(),
      getPlayersList: jest.fn(),
    };
    useCase = new GetPlayerProfileUseCase(mockPlayerRepository);
  });

  describe('execute', () => {
    it('should return player profile successfully', async () => {
      // Arrange
      const playerId = 'player-123';
      const request = { playerId };

      const mockPlayerProfile: PlayerProfile = {
        player: {
          id: playerId,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          joinDate: '2023-01-01T00:00:00.000Z',
          isActive: true,
          profileImageUrl: 'https://example.com/avatar.jpg',
          notes: 'Great player',
          preferredGameTypes: ['Texas Hold\'em', 'Omaha'],
        },
        stats: {
          totalTournaments: 15,
          totalWins: 3,
          totalPoints: 1250,
          bestFinish: 1,
          regularPoints: 1000,
          bountyPoints: 150,
          consolationPoints: 100,
          bountyCount: 5,
          consolationCount: 2,
        },
        tournamentResults: [
          {
            id: 'result-1',
            tournamentId: 'tournament-1',
            tournamentName: 'Weekly Tournament',
            seriesId: 'series-1',
            seriesName: 'Spring Series',
            seasonId: 'season-1',
            seasonName: '2023 Season',
            date: '2023-06-01T19:00:00.000Z',
            finalPosition: 1,
            points: 100,
            bountyPoints: 20,
            consolationPoints: 0,
            totalPoints: 120,
            bountyCount: 2,
            isConsolation: false,
          },
        ],
        seriesScoreboards: [
          {
            id: 'scoreboard-1',
            seriesId: 'series-1',
            seriesName: 'Spring Series',
            seasonId: 'season-1',
            seasonName: '2023 Season',
            tournamentCount: 8,
            bestFinish: 1,
            totalPoints: 650,
            regularPoints: 500,
            bountyPoints: 100,
            consolationPoints: 50,
            bountyCount: 3,
            consolationCount: 1,
          },
        ],
        qualifications: [
          {
            id: 'qualification-1',
            seasonEventName: '2023 Season Finale',
            chipCount: 15000,
            qualified: true,
            finalPosition: 3,
          },
        ],
      };

      mockPlayerRepository.getPlayerProfile.mockResolvedValue(mockPlayerProfile);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlayerProfile);
      expect(mockPlayerRepository.getPlayerProfile).toHaveBeenCalledWith(playerId);
    });

    it('should return error when player not found', async () => {
      // Arrange
      const playerId = 'non-existent-player';
      const request = { playerId };

      mockPlayerRepository.getPlayerProfile.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Player not found');
      expect(result.data).toBeUndefined();
      expect(mockPlayerRepository.getPlayerProfile).toHaveBeenCalledWith(playerId);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const playerId = 'player-123';
      const request = { playerId };

      mockPlayerRepository.getPlayerProfile.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch player profile');
      expect(result.data).toBeUndefined();
      expect(mockPlayerRepository.getPlayerProfile).toHaveBeenCalledWith(playerId);
    });

    it('should handle empty player profile data', async () => {
      // Arrange
      const playerId = 'player-123';
      const request = { playerId };

      const emptyPlayerProfile: PlayerProfile = {
        player: {
          id: playerId,
          name: 'New Player',
          joinDate: '2023-01-01T00:00:00.000Z',
          isActive: true,
        },
        stats: {
          totalTournaments: 0,
          totalWins: 0,
          totalPoints: 0,
          bestFinish: 0,
          regularPoints: 0,
          bountyPoints: 0,
          consolationPoints: 0,
          bountyCount: 0,
          consolationCount: 0,
        },
        tournamentResults: [],
        seriesScoreboards: [],
        qualifications: [],
      };

      mockPlayerRepository.getPlayerProfile.mockResolvedValue(emptyPlayerProfile);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(emptyPlayerProfile);
      expect(result.data?.stats.totalTournaments).toBe(0);
      expect(result.data?.tournamentResults).toHaveLength(0);
    });
  });
});
