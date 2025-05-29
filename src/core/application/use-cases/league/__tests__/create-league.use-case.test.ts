import { CreateLeagueUseCase } from '../create-league.use-case';
import { League } from '@/src/core/domain/entities/league';
import { ILeagueRepository } from '@/src/core/domain/repositories/league.repository';

describe('CreateLeagueUseCase', () => {
  let useCase: CreateLeagueUseCase;
  let mockLeagueRepository: jest.Mocked<ILeagueRepository>;

  beforeEach(() => {
    mockLeagueRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateLeagueUseCase(mockLeagueRepository);
  });

  describe('execute', () => {
    it('should create a league successfully', async () => {
      // Arrange
      const request = {
        name: 'Test League',
        description: 'Test Description',
        isActive: true,
        imageUrl: 'test-image.jpg',
        userId: 'user-123',
      };

      const expectedLeague = new League(
        'league-123',
        request.name,
        request.description,
        request.isActive,
        request.imageUrl,
        request.userId,
        [],
        [],
        [],
        [],
        [],
        []
      );

      mockLeagueRepository.create.mockResolvedValue(expectedLeague);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedLeague);
      expect(mockLeagueRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: request.name,
          description: request.description,
          isActive: request.isActive,
          imageUrl: request.imageUrl,
          userId: request.userId,
        })
      );
    });

    it('should return error when name is empty', async () => {
      // Arrange
      const request = {
        name: '',
        description: 'Test Description',
        isActive: true,
        imageUrl: 'test-image.jpg',
        userId: 'user-123',
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('League name is required');
      expect(mockLeagueRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when userId is missing', async () => {
      // Arrange
      const request = {
        name: 'Test League',
        description: 'Test Description',
        isActive: true,
        imageUrl: 'test-image.jpg',
        userId: '',
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User ID is required');
      expect(mockLeagueRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      // Arrange
      const request = {
        name: 'Test League',
        description: 'Test Description',
        isActive: true,
        imageUrl: 'test-image.jpg',
        userId: 'user-123',
      };

      mockLeagueRepository.create.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create league');
    });
  });
});
