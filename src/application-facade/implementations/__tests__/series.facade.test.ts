import { SeriesFacade } from '../series.facade';
import { ISeriesRepository } from '@/src/core/domain/repositories/series.repository';
import { IAuthService } from '@/src/infrastructure/services/amplify-auth.service';
import { Series } from '@/src/core/domain/entities/series';
import { GameTime } from '@/src/core/domain/value-objects/game-time';
import { CreateSeriesDTO, UpdateSeriesDTO, SeriesSearchDTO } from '@/src/core/application/dtos/series.dto';

// Mock dependencies
const mockSeriesRepository: jest.Mocked<ISeriesRepository> = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByName: jest.fn(),
  findBySeasonId: jest.fn(),
  findActive: jest.fn(),
  findCurrentlyActive: jest.fn(),
  findByDateRange: jest.fn(),
  exists: jest.fn(),
  findMostRecentBySeasonId: jest.fn(),
};

const mockAuthService: jest.Mocked<IAuthService> = {
  getCurrentUserId: jest.fn(),
  getCurrentUser: jest.fn(),
  hasRole: jest.fn(),
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  confirmSignUp: jest.fn(),
  resetPassword: jest.fn(),
  confirmResetPassword: jest.fn(),
  isAuthenticated: jest.fn(),
  getUserRoles: jest.fn(),
};

describe('SeriesFacade', () => {
  let seriesFacade: SeriesFacade;
  let mockSeries: Series;

  beforeEach(() => {
    jest.clearAllMocks();
    seriesFacade = new SeriesFacade(mockSeriesRepository, mockAuthService);

    // Create a mock series for testing
    mockSeries = Series.create(
      'series-1',
      'Test Series',
      'season-1',
      new GameTime('2024-01-01T00:00:00Z'),
      new GameTime('2024-12-31T23:59:59Z'),
      {
        description: 'Test series description',
        isActive: true,
      }
    );
  });

  describe('createSeries', () => {
    const createSeriesDTO: CreateSeriesDTO = {
      name: 'New Series',
      description: 'New series description',
      seasonId: 'season-1',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      isActive: true,
    };

    it('should create a series successfully when user is authenticated', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('user-1');
      mockSeriesRepository.create.mockResolvedValue(mockSeries);

      // Act
      const result = await seriesFacade.createSeries(createSeriesDTO);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('Test Series');
      expect(mockSeriesRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue(null);

      // Act
      const result = await seriesFacade.createSeries(createSeriesDTO);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
      expect(mockSeriesRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('user-1');
      mockSeriesRepository.create.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await seriesFacade.createSeries(createSeriesDTO);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateSeries', () => {
    const updateSeriesDTO: UpdateSeriesDTO = {
      id: 'series-1',
      name: 'Updated Series',
      description: 'Updated description',
      isActive: false,
    };

    it('should update a series successfully when user is authenticated', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('user-1');
      mockSeriesRepository.findById.mockResolvedValue(mockSeries);
      mockSeriesRepository.update.mockResolvedValue(mockSeries);

      // Act
      const result = await seriesFacade.updateSeries(updateSeriesDTO);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockSeriesRepository.findById).toHaveBeenCalledWith('series-1');
      expect(mockSeriesRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should fail when series is not found', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('user-1');
      mockSeriesRepository.findById.mockResolvedValue(null);

      // Act
      const result = await seriesFacade.updateSeries(updateSeriesDTO);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Series not found');
      expect(mockSeriesRepository.update).not.toHaveBeenCalled();
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue(null);

      // Act
      const result = await seriesFacade.updateSeries(updateSeriesDTO);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
      expect(mockSeriesRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('deleteSeries', () => {
    it('should delete a series successfully when user is authorized', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('user-1');
      mockSeriesRepository.exists.mockResolvedValue(true);
      mockSeriesRepository.delete.mockResolvedValue(undefined);

      // Act
      const result = await seriesFacade.deleteSeries('series-1', 'user-1');

      // Assert
      expect(result.success).toBe(true);
      expect(mockSeriesRepository.exists).toHaveBeenCalledWith('series-1');
      expect(mockSeriesRepository.delete).toHaveBeenCalledWith('series-1');
    });

    it('should fail when user is not authorized', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('user-2');

      // Act
      const result = await seriesFacade.deleteSeries('series-1', 'user-1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized to delete series');
      expect(mockSeriesRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail when series does not exist', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('user-1');
      mockSeriesRepository.exists.mockResolvedValue(false);

      // Act
      const result = await seriesFacade.deleteSeries('series-1', 'user-1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Series not found');
      expect(mockSeriesRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getSeries', () => {
    it('should get a series successfully when it exists', async () => {
      // Arrange
      mockSeriesRepository.findById.mockResolvedValue(mockSeries);

      // Act
      const result = await seriesFacade.getSeries('series-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('series-1');
      expect(mockSeriesRepository.findById).toHaveBeenCalledWith('series-1');
    });

    it('should fail when series is not found', async () => {
      // Arrange
      mockSeriesRepository.findById.mockResolvedValue(null);

      // Act
      const result = await seriesFacade.getSeries('series-1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Series not found');
    });
  });

  describe('getAllSeries', () => {
    it('should get all series with pagination', async () => {
      // Arrange
      const seriesList = [mockSeries];
      mockSeriesRepository.findAll.mockResolvedValue(seriesList);

      const searchDTO: SeriesSearchDTO = {
        page: 1,
        pageSize: 10,
      };

      // Act
      const result = await seriesFacade.getAllSeries(searchDTO);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.series).toHaveLength(1);
      expect(result.data?.total).toBe(1);
      expect(result.data?.page).toBe(1);
      expect(result.data?.pageSize).toBe(10);
      expect(result.data?.hasMore).toBe(false);
    });

    it('should search series by name', async () => {
      // Arrange
      const seriesList = [mockSeries];
      mockSeriesRepository.findByName.mockResolvedValue(seriesList);

      const searchDTO: SeriesSearchDTO = {
        name: 'Test',
      };

      // Act
      const result = await seriesFacade.getAllSeries(searchDTO);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSeriesRepository.findByName).toHaveBeenCalledWith('Test');
    });

    it('should filter series by season and active status', async () => {
      // Arrange
      const seriesList = [mockSeries];
      mockSeriesRepository.findAll.mockResolvedValue(seriesList);

      const searchDTO: SeriesSearchDTO = {
        seasonId: 'season-1',
        isActive: true,
      };

      // Act
      const result = await seriesFacade.getAllSeries(searchDTO);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.series).toHaveLength(1);
    });
  });

  describe('getSeriesBySeason', () => {
    it('should get series by season successfully', async () => {
      // Arrange
      const seriesList = [mockSeries];
      mockSeriesRepository.findBySeasonId.mockResolvedValue(seriesList);

      // Act
      const result = await seriesFacade.getSeriesBySeason('season-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(mockSeriesRepository.findBySeasonId).toHaveBeenCalledWith('season-1');
    });
  });

  describe('getActiveSeries', () => {
    it('should get active series successfully', async () => {
      // Arrange
      const seriesList = [mockSeries];
      mockSeriesRepository.findActive.mockResolvedValue(seriesList);

      // Act
      const result = await seriesFacade.getActiveSeries();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(mockSeriesRepository.findActive).toHaveBeenCalledTimes(1);
    });

    it('should filter active series by season', async () => {
      // Arrange
      const seriesList = [mockSeries];
      mockSeriesRepository.findActive.mockResolvedValue(seriesList);

      // Act
      const result = await seriesFacade.getActiveSeries('season-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getSeriesSummary', () => {
    it('should get series summary successfully', async () => {
      // Arrange
      mockSeriesRepository.findById.mockResolvedValue(mockSeries);

      // Act
      const result = await seriesFacade.getSeriesSummary('series-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('series-1');
      expect(result.data?.name).toBe('Test Series');
      expect(result.data?.isActive).toBe(true);
    });

    it('should fail when series is not found', async () => {
      // Arrange
      mockSeriesRepository.findById.mockResolvedValue(null);

      // Act
      const result = await seriesFacade.getSeriesSummary('series-1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Series not found');
    });
  });

  describe('getSeriesStats', () => {
    it('should get series stats successfully', async () => {
      // Arrange
      mockSeriesRepository.findById.mockResolvedValue(mockSeries);

      // Act
      const result = await seriesFacade.getSeriesStats('series-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('series-1');
      expect(result.data?.name).toBe('Test Series');
    });
  });

  describe('toggleSeriesStatus', () => {
    it('should toggle series status successfully when user is authorized', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('user-1');
      mockSeriesRepository.findById.mockResolvedValue(mockSeries);
      mockSeriesRepository.update.mockResolvedValue(mockSeries);

      // Act
      const result = await seriesFacade.toggleSeriesStatus('series-1', false, 'user-1');

      // Assert
      expect(result.success).toBe(true);
      expect(mockSeriesRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should fail when user is not authorized', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('user-2');

      // Act
      const result = await seriesFacade.toggleSeriesStatus('series-1', false, 'user-1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized to modify series');
    });
  });

  describe('seriesExists', () => {
    it('should check if series exists successfully', async () => {
      // Arrange
      mockSeriesRepository.exists.mockResolvedValue(true);

      // Act
      const result = await seriesFacade.seriesExists('series-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
      expect(mockSeriesRepository.exists).toHaveBeenCalledWith('series-1');
    });

    it('should return false when series does not exist', async () => {
      // Arrange
      mockSeriesRepository.exists.mockResolvedValue(false);

      // Act
      const result = await seriesFacade.seriesExists('series-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.exists).toBe(false);
    });
  });
});
