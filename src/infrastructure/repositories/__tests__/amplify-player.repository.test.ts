import { AmplifyPlayerRepository } from '../amplify-player.repository';
import { Player } from '@/src/core/domain/entities/player';
import { PlayerSearchCriteria } from '@/src/core/domain/repositories/player.repository';
import { generateClient } from 'aws-amplify/data';

// Mock AWS Amplify data
jest.mock('aws-amplify/data', () => ({
  generateClient: jest.fn(),
}));

const mockGenerateClient = generateClient as jest.Mock;

// Mock the data client
const mockClient = {
  models: {
    Player: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
    },
  },
};

describe('AmplifyPlayerRepository', () => {
  let repository: AmplifyPlayerRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateClient.mockReturnValue(mockClient);
    repository = new AmplifyPlayerRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('save', () => {
    it('should create a new player when player does not exist', async () => {
      // Arrange
      const player = Player.create('player-1', 'John Doe', {
        email: 'john@example.com',
        isActive: true,
      });

      const mockAmplifyPlayer = {
        id: 'player-1',
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
        joinDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockClient.models.Player.get.mockResolvedValue({ data: null });
      mockClient.models.Player.create.mockResolvedValue({ data: mockAmplifyPlayer });

      // Act
      const result = await repository.save(player);

      // Assert
      expect(result).toBeInstanceOf(Player);
      expect(result.id).toBe('player-1');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(mockClient.models.Player.get).toHaveBeenCalledWith({ id: 'player-1' });
      expect(mockClient.models.Player.create).toHaveBeenCalledWith({
        id: 'player-1',
        name: 'John Doe',
        userId: 'system',
        email: 'john@example.com',
        phone: null,
        profileImageUrl: null,
        notes: null,
        isActive: true,
        joinDate: expect.any(String),
      });
    });

    it('should update an existing player when player exists', async () => {
      // Arrange
      const player = Player.create('player-1', 'John Doe Updated', {
        email: 'john.updated@example.com',
        isActive: false,
      });

      const existingPlayer = {
        id: 'player-1',
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
      };

      const updatedPlayer = {
        id: 'player-1',
        name: 'John Doe Updated',
        email: 'john.updated@example.com',
        isActive: false,
        joinDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockClient.models.Player.get.mockResolvedValue({ data: existingPlayer });
      mockClient.models.Player.update.mockResolvedValue({ data: updatedPlayer });

      // Act
      const result = await repository.save(player);

      // Assert
      expect(result).toBeInstanceOf(Player);
      expect(result.name).toBe('John Doe Updated');
      expect(result.email).toBe('john.updated@example.com');
      expect(result.isActive).toBe(false);
      expect(mockClient.models.Player.update).toHaveBeenCalledWith({
        id: 'player-1',
        name: 'John Doe Updated',
        userId: 'system',
        email: 'john.updated@example.com',
        phone: null,
        profileImageUrl: null,
        notes: null,
        isActive: false,
        joinDate: expect.any(String),
      });
    });

    it('should handle save errors', async () => {
      // Arrange
      const player = Player.create('player-1', 'John Doe');
      mockClient.models.Player.get.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(repository.save(player)).rejects.toThrow('Failed to save player: Database error');
    });
  });

  describe('findById', () => {
    it('should find a player by ID successfully', async () => {
      // Arrange
      const mockAmplifyPlayer = {
        id: 'player-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        isActive: true,
        joinDate: '2024-01-15T10:00:00Z',
        profileImageUrl: 'https://example.com/avatar.jpg',
        notes: 'Good player',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockClient.models.Player.get.mockResolvedValue({ data: mockAmplifyPlayer });

      // Act
      const result = await repository.findById('player-1');

      // Assert
      expect(result).toBeInstanceOf(Player);
      expect(result?.id).toBe('player-1');
      expect(result?.name).toBe('John Doe');
      expect(result?.email).toBe('john@example.com');
      expect(result?.phone).toBe('+1234567890');
      expect(result?.isActive).toBe(true);
      expect(result?.profileImageUrl).toBe('https://example.com/avatar.jpg');
      expect(result?.notes).toBe('Good player');
      expect(mockClient.models.Player.get).toHaveBeenCalledWith({ id: 'player-1' });
    });

    it('should return null when player is not found', async () => {
      // Arrange
      mockClient.models.Player.get.mockResolvedValue({ data: null });

      // Act
      const result = await repository.findById('player-1');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle find errors', async () => {
      // Arrange
      mockClient.models.Player.get.mockRejectedValue(new Error('Find failed'));

      // Act & Assert
      await expect(repository.findById('player-1')).rejects.toThrow('Failed to find player by ID: Find failed');
    });
  });

  describe('findMany', () => {
    it('should find players with search criteria', async () => {
      // Arrange
      const mockAmplifyPlayers = [
        {
          id: 'player-1',
          name: 'John Doe',
          email: 'john@example.com',
          isActive: true,
          joinDate: '2024-01-15T10:00:00Z',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'player-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          isActive: true,
          joinDate: '2024-01-10T10:00:00Z',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockClient.models.Player.list.mockResolvedValue({ data: mockAmplifyPlayers });

      const criteria: PlayerSearchCriteria = {
        query: 'John',
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
      expect(result.players[0]).toBeInstanceOf(Player);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(mockClient.models.Player.list).toHaveBeenCalledWith({
        filter: {
          and: [
            { name: { contains: 'John' } },
            { isActive: { eq: true } },
          ],
        },
      });
    });

    it('should handle empty search results', async () => {
      // Arrange
      mockClient.models.Player.list.mockResolvedValue({ data: null });

      const criteria: PlayerSearchCriteria = {
        query: 'NonExistent',
      };

      // Act
      const result = await repository.findMany(criteria);

      // Assert
      expect(result.players).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.totalPages).toBe(0);
    });

    it('should apply pagination correctly', async () => {
      // Arrange
      const mockAmplifyPlayers = Array.from({ length: 25 }, (_, i) => ({
        id: `player-${i + 1}`,
        name: `Player ${i + 1}`,
        email: `player${i + 1}@example.com`,
        isActive: true,
        joinDate: '2024-01-15T10:00:00Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      mockClient.models.Player.list.mockResolvedValue({ data: mockAmplifyPlayers });

      const criteria: PlayerSearchCriteria = {
        page: 2,
        pageSize: 10,
      };

      // Act
      const result = await repository.findMany(criteria);

      // Assert
      expect(result.players).toHaveLength(10);
      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.players[0].id).toBe('player-11');
    });

    it('should handle search errors', async () => {
      // Arrange
      mockClient.models.Player.list.mockRejectedValue(new Error('Search failed'));

      const criteria: PlayerSearchCriteria = {
        query: 'John',
      };

      // Act & Assert
      await expect(repository.findMany(criteria)).rejects.toThrow('Failed to search players: Search failed');
    });
  });

  describe('findAllActive', () => {
    it('should find all active players successfully', async () => {
      // Arrange
      const mockAmplifyPlayers = [
        {
          id: 'player-1',
          name: 'John Doe',
          email: 'john@example.com',
          isActive: true,
          joinDate: '2024-01-15T10:00:00Z',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'player-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          isActive: true,
          joinDate: '2024-01-10T10:00:00Z',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockClient.models.Player.list.mockResolvedValue({ data: mockAmplifyPlayers });

      // Act
      const result = await repository.findAllActive();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Player);
      expect(result[0].isActive).toBe(true);
      expect(result[1]).toBeInstanceOf(Player);
      expect(result[1].isActive).toBe(true);
      expect(mockClient.models.Player.list).toHaveBeenCalledWith({
        filter: { isActive: { eq: true } },
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      mockClient.models.Player.list.mockResolvedValue({ data: null });

      // Act
      const result = await repository.findAllActive();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle find active errors', async () => {
      // Arrange
      mockClient.models.Player.list.mockRejectedValue(new Error('Find active failed'));

      // Act & Assert
      await expect(repository.findAllActive()).rejects.toThrow('Failed to find active players: Find active failed');
    });
  });

  describe('exists', () => {
    it('should return true when player exists', async () => {
      // Arrange
      const mockAmplifyPlayer = {
        id: 'player-1',
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
        joinDate: '2024-01-15T10:00:00Z',
      };

      mockClient.models.Player.get.mockResolvedValue({ data: mockAmplifyPlayer });

      // Act
      const result = await repository.exists('player-1');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when player does not exist', async () => {
      // Arrange
      mockClient.models.Player.get.mockResolvedValue({ data: null });

      // Act
      const result = await repository.exists('player-1');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when get operation fails', async () => {
      // Arrange
      mockClient.models.Player.get.mockRejectedValue(new Error('Get failed'));

      // Act
      const result = await repository.exists('player-1');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a player successfully', async () => {
      // Arrange
      mockClient.models.Player.delete.mockResolvedValue({ data: { id: 'player-1' } });

      // Act
      await repository.delete('player-1');

      // Assert
      expect(mockClient.models.Player.delete).toHaveBeenCalledWith({ id: 'player-1' });
    });

    it('should handle deletion errors', async () => {
      // Arrange
      mockClient.models.Player.delete.mockRejectedValue(new Error('Deletion failed'));

      // Act & Assert
      await expect(repository.delete('player-1')).rejects.toThrow('Failed to delete player: Deletion failed');
    });

    it('should handle case when player is not found for deletion', async () => {
      // Arrange
      mockClient.models.Player.delete.mockResolvedValue({ data: null });

      // Act & Assert
      await expect(repository.delete('player-1')).rejects.toThrow('Failed to delete player: Player not found or already deleted');
    });
  });

  describe('count', () => {
    it('should count players successfully', async () => {
      // Arrange
      const mockAmplifyPlayers = [
        { id: 'player-1', name: 'John Doe' },
        { id: 'player-2', name: 'Jane Smith' },
        { id: 'player-3', name: 'Bob Johnson' },
      ];

      mockClient.models.Player.list.mockResolvedValue({ data: mockAmplifyPlayers });

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(3);
      expect(mockClient.models.Player.list).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when no players exist', async () => {
      // Arrange
      mockClient.models.Player.list.mockResolvedValue({ data: null });

      // Act
      const result = await repository.count();

      // Assert
      expect(result).toBe(0);
    });

    it('should handle count errors', async () => {
      // Arrange
      mockClient.models.Player.list.mockRejectedValue(new Error('Count failed'));

      // Act & Assert
      await expect(repository.count()).rejects.toThrow('Failed to count players: Count failed');
    });
  });
});
