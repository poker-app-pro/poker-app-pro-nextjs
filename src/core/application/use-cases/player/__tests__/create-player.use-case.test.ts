import { CreatePlayerUseCase } from '../create-player.use-case';
import { IPlayerRepository } from '../../../../domain/repositories/player.repository';
import { Player } from '../../../../domain/entities/player';
import { CreatePlayerDto } from '../../../dtos/player.dto';

// Mock repository
const mockPlayerRepository: jest.Mocked<IPlayerRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  findAllActive: jest.fn(),
  exists: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

describe('CreatePlayerUseCase', () => {
  let useCase: CreatePlayerUseCase;

  beforeEach(() => {
    useCase = new CreatePlayerUseCase(mockPlayerRepository);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a player with required fields only', async () => {
      const dto: CreatePlayerDto = {
        name: 'John Doe',
      };

      const mockSavedPlayer = Player.create('player_123', 'John Doe');
      mockPlayerRepository.save.mockResolvedValue(mockSavedPlayer);

      const result = await useCase.execute(dto);

      expect(mockPlayerRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          isActive: true,
        })
      );

      expect(result).toEqual({
        id: 'player_123',
        name: 'John Doe',
        email: undefined,
        phone: undefined,
        profileImageUrl: undefined,
        notes: undefined,
        isActive: true,
        joinDate: expect.any(String),
      });
    });

    it('should create a player with all optional fields', async () => {
      const dto: CreatePlayerDto = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
        profileImageUrl: 'https://example.com/avatar.jpg',
        notes: 'VIP player',
      };

      const mockSavedPlayer = Player.create('player_456', 'Jane Smith', {
        email: 'jane@example.com',
        phone: '+1234567890',
        profileImageUrl: 'https://example.com/avatar.jpg',
        notes: 'VIP player',
      });
      mockPlayerRepository.save.mockResolvedValue(mockSavedPlayer);

      const result = await useCase.execute(dto);

      expect(mockPlayerRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1234567890',
          profileImageUrl: 'https://example.com/avatar.jpg',
          notes: 'VIP player',
          isActive: true,
        })
      );

      expect(result).toEqual({
        id: 'player_456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
        profileImageUrl: 'https://example.com/avatar.jpg',
        notes: 'VIP player',
        isActive: true,
        joinDate: expect.any(String),
      });
    });

    it('should throw error for empty name', async () => {
      const dto: CreatePlayerDto = {
        name: '',
      };

      await expect(useCase.execute(dto)).rejects.toThrow('Player name is required');
      expect(mockPlayerRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for whitespace-only name', async () => {
      const dto: CreatePlayerDto = {
        name: '   ',
      };

      await expect(useCase.execute(dto)).rejects.toThrow('Player name is required');
      expect(mockPlayerRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for undefined name', async () => {
      const dto = {} as CreatePlayerDto;

      await expect(useCase.execute(dto)).rejects.toThrow('Player name is required');
      expect(mockPlayerRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const dto: CreatePlayerDto = {
        name: 'John Doe',
      };

      mockPlayerRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(dto)).rejects.toThrow('Database error');
    });

    it('should generate unique player IDs', async () => {
      const dto: CreatePlayerDto = {
        name: 'Test Player',
      };

      const mockPlayer1 = Player.create('player_123_abc', 'Test Player');
      const mockPlayer2 = Player.create('player_456_def', 'Test Player');

      mockPlayerRepository.save
        .mockResolvedValueOnce(mockPlayer1)
        .mockResolvedValueOnce(mockPlayer2);

      const result1 = await useCase.execute(dto);
      const result2 = await useCase.execute(dto);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toBe('player_123_abc');
      expect(result2.id).toBe('player_456_def');
    });

    it('should trim whitespace from name', async () => {
      const dto: CreatePlayerDto = {
        name: '  John Doe  ',
      };

      const mockSavedPlayer = Player.create('player_123', 'John Doe');
      mockPlayerRepository.save.mockResolvedValue(mockSavedPlayer);

      const result = await useCase.execute(dto);

      expect(mockPlayerRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
        })
      );

      expect(result.name).toBe('John Doe');
    });

    it('should return valid ISO date string', async () => {
      const dto: CreatePlayerDto = {
        name: 'John Doe',
      };

      const mockSavedPlayer = Player.create('player_123', 'John Doe');
      mockPlayerRepository.save.mockResolvedValue(mockSavedPlayer);

      const result = await useCase.execute(dto);

      expect(result.joinDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(result.joinDate)).toBeInstanceOf(Date);
      expect(isNaN(new Date(result.joinDate).getTime())).toBe(false);
    });
  });
});
