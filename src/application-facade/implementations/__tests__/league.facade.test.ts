import { LeagueFacade } from '../league.facade';
import { ILeagueRepository } from '../../../core/domain/repositories/league.repository';
import { IAuthService } from '../../../infrastructure/services/amplify-auth.service';
import { League } from '../../../core/domain/entities/league';
import { CreateLeagueDTO, UpdateLeagueDTO, LeagueSearchDTO } from '../../../core/application/dtos/league.dto';

// Mock dependencies
const mockLeagueRepository: jest.Mocked<ILeagueRepository> = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByName: jest.fn(),
  findByOwnerId: jest.fn(),
  findActive: jest.fn(),
  exists: jest.fn(),
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

describe('LeagueFacade', () => {
  let leagueFacade: LeagueFacade;
  let mockLeague: League;

  beforeEach(() => {
    jest.clearAllMocks();
    leagueFacade = new LeagueFacade(mockLeagueRepository, mockAuthService);
    
    // Create a mock league for testing
    mockLeague = League.create(
      'league-1',
      'Test League',
      'owner-1',
      {
        description: 'Test league description',
        isActive: true,
      }
    );
  });

  describe('createLeague', () => {
    const createLeagueDTO: CreateLeagueDTO = {
      name: 'New League',
      description: 'New league description',
      ownerId: 'owner-1',
      isActive: true,
    };

    it('should create a league successfully when user is authenticated', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('owner-1');
      mockLeagueRepository.create.mockResolvedValue(mockLeague);

      // Act
      const result = await leagueFacade.createLeague(createLeagueDTO);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('Test League');
      expect(mockLeagueRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue(null);

      // Act
      const result = await leagueFacade.createLeague(createLeagueDTO);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
      expect(mockLeagueRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('owner-1');
      mockLeagueRepository.create.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await leagueFacade.createLeague(createLeagueDTO);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateLeague', () => {
    const updateLeagueDTO: UpdateLeagueDTO = {
      id: 'league-1',
      name: 'Updated League',
      description: 'Updated description',
      isActive: false,
    };

    it('should update a league successfully when user is the owner', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('owner-1');
      mockLeagueRepository.findById.mockResolvedValue(mockLeague);
      mockLeagueRepository.update.mockResolvedValue(mockLeague);

      // Act
      const result = await leagueFacade.updateLeague(updateLeagueDTO);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockLeagueRepository.findById).toHaveBeenCalledWith('league-1');
      expect(mockLeagueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should update a league successfully when user is admin', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('admin-user');
      mockAuthService.hasRole.mockResolvedValue(true);
      mockLeagueRepository.findById.mockResolvedValue(mockLeague);
      mockLeagueRepository.update.mockResolvedValue(mockLeague);

      // Act
      const result = await leagueFacade.updateLeague(updateLeagueDTO);

      // Assert
      expect(result.success).toBe(true);
      expect(mockAuthService.hasRole).toHaveBeenCalledWith('ADMIN');
    });

    it('should fail when user is not the owner and not admin', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('other-user');
      mockAuthService.hasRole.mockResolvedValue(false);
      mockLeagueRepository.findById.mockResolvedValue(mockLeague);

      // Act
      const result = await leagueFacade.updateLeague(updateLeagueDTO);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized to update this league');
      expect(mockLeagueRepository.update).not.toHaveBeenCalled();
    });

    it('should fail when league is not found', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('owner-1');
      mockLeagueRepository.findById.mockResolvedValue(null);

      // Act
      const result = await leagueFacade.updateLeague(updateLeagueDTO);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('League not found');
      expect(mockLeagueRepository.update).not.toHaveBeenCalled();
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue(null);

      // Act
      const result = await leagueFacade.updateLeague(updateLeagueDTO);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
      expect(mockLeagueRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('deleteLeague', () => {
    it('should delete a league successfully when user is the owner', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('owner-1');
      mockLeagueRepository.findById.mockResolvedValue(mockLeague);
      mockLeagueRepository.delete.mockResolvedValue(undefined);

      // Act
      const result = await leagueFacade.deleteLeague('league-1', 'owner-1');

      // Assert
      expect(result.success).toBe(true);
      expect(mockLeagueRepository.findById).toHaveBeenCalledWith('league-1');
      expect(mockLeagueRepository.delete).toHaveBeenCalledWith('league-1');
    });

    it('should delete a league successfully when user is admin', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('admin-user');
      mockAuthService.hasRole.mockResolvedValue(true);
      mockLeagueRepository.findById.mockResolvedValue(mockLeague);
      mockLeagueRepository.delete.mockResolvedValue(undefined);

      // Act
      const result = await leagueFacade.deleteLeague('league-1', 'admin-user');

      // Assert
      expect(result.success).toBe(true);
      expect(mockAuthService.hasRole).toHaveBeenCalledWith('ADMIN');
    });

    it('should fail when user is not authorized', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('other-user');

      // Act
      const result = await leagueFacade.deleteLeague('league-1', 'owner-1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized to delete league');
      expect(mockLeagueRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail when league is not found', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('owner-1');
      mockLeagueRepository.findById.mockResolvedValue(null);

      // Act
      const result = await leagueFacade.deleteLeague('league-1', 'owner-1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('League not found');
      expect(mockLeagueRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail when user is not the owner and not admin', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('other-user');
      mockAuthService.hasRole.mockResolvedValue(false);
      mockLeagueRepository.findById.mockResolvedValue(mockLeague);

      // Act
      const result = await leagueFacade.deleteLeague('league-1', 'other-user');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized to delete this league');
      expect(mockLeagueRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getLeague', () => {
    it('should get a league successfully when it exists', async () => {
      // Arrange
      mockLeagueRepository.findById.mockResolvedValue(mockLeague);

      // Act
      const result = await leagueFacade.getLeague('league-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('league-1');
      expect(mockLeagueRepository.findById).toHaveBeenCalledWith('league-1');
    });

    it('should fail when league is not found', async () => {
      // Arrange
      mockLeagueRepository.findById.mockResolvedValue(null);

      // Act
      const result = await leagueFacade.getLeague('league-1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('League not found');
    });
  });

  describe('getLeagues', () => {
    it('should get all leagues with pagination', async () => {
      // Arrange
      const leaguesList = [mockLeague];
      mockLeagueRepository.findAll.mockResolvedValue(leaguesList);

      const searchDTO: LeagueSearchDTO = {
        page: 1,
        pageSize: 10,
      };

      // Act
      const result = await leagueFacade.getLeagues(searchDTO);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.leagues).toHaveLength(1);
      expect(result.data?.totalCount).toBe(1);
    });

    it('should search leagues by search term', async () => {
      // Arrange
      const leaguesList = [mockLeague];
      mockLeagueRepository.findByName.mockResolvedValue(leaguesList);

      const searchDTO: LeagueSearchDTO = {
        searchTerm: 'Test',
      };

      // Act
      const result = await leagueFacade.getLeagues(searchDTO);

      // Assert
      expect(result.success).toBe(true);
      expect(mockLeagueRepository.findByName).toHaveBeenCalledWith('Test');
    });

    it('should filter leagues by owner and active status', async () => {
      // Arrange
      const leaguesList = [mockLeague];
      mockLeagueRepository.findAll.mockResolvedValue(leaguesList);

      const searchDTO: LeagueSearchDTO = {
        ownerId: 'owner-1',
        isActive: true,
      };

      // Act
      const result = await leagueFacade.getLeagues(searchDTO);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.leagues).toHaveLength(1);
    });
  });

  describe('getLeaguesByOwner', () => {
    it('should get leagues by owner successfully', async () => {
      // Arrange
      const leaguesList = [mockLeague];
      mockLeagueRepository.findByOwnerId.mockResolvedValue(leaguesList);

      // Act
      const result = await leagueFacade.getLeaguesByOwner('owner-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(mockLeagueRepository.findByOwnerId).toHaveBeenCalledWith('owner-1');
    });
  });

  describe('getActiveLeagues', () => {
    it('should get active leagues successfully', async () => {
      // Arrange
      const leaguesList = [mockLeague];
      mockLeagueRepository.findActive.mockResolvedValue(leaguesList);

      // Act
      const result = await leagueFacade.getActiveLeagues();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(mockLeagueRepository.findActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggleLeagueStatus', () => {
    it('should toggle league status successfully when user is the owner', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('owner-1');
      mockLeagueRepository.findById.mockResolvedValue(mockLeague);
      mockLeagueRepository.update.mockResolvedValue(mockLeague);

      // Act
      const result = await leagueFacade.toggleLeagueStatus('league-1', false, 'owner-1');

      // Assert
      expect(result.success).toBe(true);
      expect(mockLeagueRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should toggle league status successfully when user is admin', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('admin-user');
      mockAuthService.hasRole.mockResolvedValue(true);
      mockLeagueRepository.findById.mockResolvedValue(mockLeague);
      mockLeagueRepository.update.mockResolvedValue(mockLeague);

      // Act
      const result = await leagueFacade.toggleLeagueStatus('league-1', false, 'admin-user');

      // Assert
      expect(result.success).toBe(true);
      expect(mockAuthService.hasRole).toHaveBeenCalledWith('ADMIN');
    });

    it('should fail when user is not authorized', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('other-user');

      // Act
      const result = await leagueFacade.toggleLeagueStatus('league-1', false, 'owner-1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized to modify league');
    });

    it('should fail when league is not found', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('owner-1');
      mockLeagueRepository.findById.mockResolvedValue(null);

      // Act
      const result = await leagueFacade.toggleLeagueStatus('league-1', false, 'owner-1');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('League not found');
      expect(mockLeagueRepository.update).not.toHaveBeenCalled();
    });

    it('should fail when user is not the owner and not admin', async () => {
      // Arrange
      mockAuthService.getCurrentUserId.mockResolvedValue('other-user');
      mockAuthService.hasRole.mockResolvedValue(false);
      mockLeagueRepository.findById.mockResolvedValue(mockLeague);

      // Act
      const result = await leagueFacade.toggleLeagueStatus('league-1', false, 'other-user');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized to modify this league');
      expect(mockLeagueRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('leagueExists', () => {
    it('should check if league exists successfully', async () => {
      // Arrange
      mockLeagueRepository.exists.mockResolvedValue(true);

      // Act
      const result = await leagueFacade.leagueExists('league-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
      expect(mockLeagueRepository.exists).toHaveBeenCalledWith('league-1');
    });

    it('should return false when league does not exist', async () => {
      // Arrange
      mockLeagueRepository.exists.mockResolvedValue(false);

      // Act
      const result = await leagueFacade.leagueExists('league-1');

      // Assert
      expect(result.success).toBe(true);
      expect(result.exists).toBe(false);
    });
  });
});
