import { AmplifyPlayerRepository } from '../amplify-player.repository';
import { Player } from '../../../core/domain/entities/player';
import { GameTime } from '../../../core/domain/value-objects/game-time';
import { PlayerSearchCriteria } from '../../../core/domain/repositories/player.repository';

// Mock the Amplify client
jest.mock('aws-amplify/data', () => ({
  generateClient: jest.fn(() => ({
    models: {
      Player: {
        create: jest.fn(),
        update: jest.fn(),
        get: jest.fn(),
        list: jest.fn(),
        delete: jest.fn(),
      }
    }
  }))
}));

describe('AmplifyPlayerRepository', () => {
  let repository: AmplifyPlayerRepository;
  let mockClient: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    repository = new AmplifyPlayerRepository();
    mockClient = (repository as any).client;
  });

  describe('save', () => {
    it('should create a new player when player does not exist', async () => {
      // Arrange
      const player = Player.create(
        'player-1',
        'John Doe',
        {
          email: 'john@example.com',
          isActive: true,
          joinDate: new GameTime(new Date('2024-01-01')),
        }
      );

      mockClient.models.Player.get.mockResolvedValue({ data: null });
      mockClient.models.Player.create.mockResolvedValue({
        data: {
          id: 'player-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: null,
          profileImageUrl: null,
          notes: null,
          isActive: true,
          joinDate: '2024-01-01T00:00:00.000Z',
        }
      });

      // Act
      const result = await repository.save(player);

      // Assert
      expect(mockClient.models.Player.create).toHaveBeenCalledWith({
        id: 'player-1',
        name: 'John Doe',
        userId: 'system',
        email: 'john@example.com',
        phone: null,
        profileImageUrl: null,
        notes: null,
        isActive: true,
        joinDate: player.joinDate.toISOString(),
      });
      expect(result).toBeInstanceOf(Player);
      expect(result.id).toBe('player-1');
      expect(result.name).toBe('John Doe');
    });

    it('should update an existing player', async () => {
      // Arrange
      const existingPlayerData = {
        id: 'player-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        profileImageUrl: null,
        notes: null,
        isActive: true,
        joinDate: '2024-01-01T00:00:00.000Z',
      };

      const updatedPlayer = Player.create(
        'player-1',
        'John Smith',
        {
          email: 'johnsmith@example.com',
          isActive: true,
          joinDate: new GameTime(new Date('2024-01-01')),
        }
      );

      mockClient.models.Player.get
        .mockResolvedValueOnce({ data: existingPlayerData })
        .mockResolvedValueOnce({ data: existingPlayerData });
      
      mockClient.models.Player.update.mockResolvedValue({
        data: {
          ...existingPlayerData,
          name: 'John Smith',
          email: 'johnsmith@example.com',
        }
      });

      // Act
      const result = await repository.save(updatedPlayer);

      // Assert
      expect(mockClient.models.Player.update).toHaveBeenCalledWith({
        id: 'player-1',
        name: 'John Smith',
        userId: 'system',
        email: 'johnsmith@example.com',
        phone: null,
        profileImageUrl: null,
        notes: null,
        isActive: true,
        joinDate: updatedPlayer.joinDate.toISOString(),
      });
      expect(result).toBeInstanceOf(Player);
    });

    it('should throw error when create fails', async () => {
      // Arrange
      const player = Player.create(
        'player-1',
        'John Doe',
        {
          isActive: true,
          joinDate: new GameTime(new Date()),
        }
      );

      mockClient.models.Player.get.mockResolvedValue({ data: null });
      mockClient.models.Player.create.mockResolvedValue({ data: null });

      // Act & Assert
      await expect(repository.save(player)).rejects.toThrow('Failed to create player');
    });
  });

  describe('findById', () => {
    it('should return player when found', async () => {
      // Arrange
      const playerData = {
        id: 'player-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        profileImageUrl: null,
        notes: null,
        isActive: true,
        joinDate: '2024-01-01T00:00:00.000Z',
      };

      mockClient.models.Player.get.mockResolvedValue({ data: playerData });

      // Act
      const result = await repository.findById('player-1');

      // Assert
      expect(result).toBeInstanceOf(Player);
      expect(result?.id).toBe('player-1');
      expect(result?.name).toBe('John Doe');
      expect(result?.email).toBe('john@example.com');
    });

    it('should return null when player not found', async () => {
      // Arrange
      mockClient.models.Player.get.mockResolvedValue({ data: null });

      // Act
      const result = await repository.findById('non-existent');

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error when get fails', async () => {
      // Arrange
      mockClient.models.Player.get.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(repository.findById('player-1')).rejects.toThrow('Failed to find player by ID');
    });
  });

  describe('findMany', () => {
    it('should return paginated results with filters', async () => {
      // Arrange
      const playersData = [
        {
          id: 'player-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: null,
          profileImageUrl: null,
          notes: null,
          isActive: true,
          joinDate: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'player-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: null,
          profileImageUrl: null,
          notes: null,
          isActive: true,
          joinDate: '2024-01-02T00:00:00.000Z',
        }
      ];

      mockClient.models.Player.list.mockResolvedValue({ data: playersData });

      const criteria: PlayerSearchCriteria = {
        query: 'john',
        isActive: true,
        page: 1,
        pageSize: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      };

      // Act
      const result = await repository.findMany(criteria);

      // Assert
      expect(result.players).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.players[0]).toBeInstanceOf(Player);
    });

    it('should return empty results when no players found', async () => {
      // Arrange
      mockClient.models.Player.list.mockResolvedValue({ data: null });

      const criteria: PlayerSearchCriteria = {
        query: 'nonexistent',
      };

      // Act
      const result = await repository.findMany(criteria);

      // Assert
      expect(result.players).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findAllActive', () => {
    it('should return all active players', async () => {
      // Arrange
      const playersData = [
        {
          id: 'player-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: null,
          profileImageUrl: null,
          notes: null,
          isActive: true,
          joinDate: '2024-01-01T00:00:00.000Z',
        }
      ];

      mockClient.models.Player.list.mockResolvedValue({ data: playersData });

      // Act
      const result = await repository.findAllActive();

      // Assert
      expect(mockClient.models.Player.list).toHaveBeenCalledWith({
        filter: { isActive: { eq: true } }
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Player);
    });
  });

  describe('exists', () => {
    it('should return true when player exists', async () => {
      // Arrange
      const playerData = {
        id: 'player-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        profileImageUrl: null,
        notes: null,
        isActive: true,
        joinDate: '2024-01-01T00:00:00.000Z',
      };

      mockClient.models.Player.get.mockResolvedValue({ data: playerData });

      // Act
      const result = await repository.exists('player-1');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when player does not exist', async () => {
      // Arrange
      mockClient.models.Player.get.mockResolvedValue({ data: null });

      // Act
      const result = await repository.exists('non-existent');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when error occurs', async () => {
      // Arrange
      mockClient.models.Player.get.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await repository.exists('player-1');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete player successfully', async () => {
      // Arrange
      mockClient.models.Player.delete.mockResolvedValue({
        data: { id: 'player-1' }
      });

      // Act
      await repository.delete('player-1');

      // Assert
      expect(mockClient.models.Player.delete).toHaveBeenCalledWith({ id: 'player-1' });
    });

    it('should throw error when delete fails', async () => {
      // Arrange
      mockClient.models.Player.delete.mockResolvedValue({ data: null });

      // Act & Assert
      await expect(repository.delete('player-1')).rejects.toThrow('Player not found or already deleted');
    });
  });

  describe('count', () => {
    it('should return total count of players', async () => {
      // Arrange
      const playersData = [
        { id: 'player-1', name: 'John' },
        { id: 'player-2', name: 'Jane' }
      ];

      mockClient.models.Player.list.mockResolvedValue({ data: playersData });

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(2);
    });

    it('should return 0 when no players found', async () => {
      // Arrange
      mockClient.models.Player.list.mockResolvedValue({ data: null });

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(0);
    });
  });
});
