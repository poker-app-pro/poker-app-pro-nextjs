import { DIContainer, container } from '../container';
import { IPlayerRepository } from '@/src/core/domain/repositories/player.repository';
import { IGameResultRepository } from '@/src/core/domain/repositories/game-result.repository';
import { CreatePlayerUseCase } from '@/src/core/application/use-cases/player/create-player.use-case';
import { UpdatePlayerUseCase } from '@/src/core/application/use-cases/player/update-player.use-case';
import { SearchPlayersUseCase } from '@/src/core/application/use-cases/player/search-players.use-case';
import { CreateGameResultUseCase } from '@/src/core/application/use-cases/game-result/create-game-result.use-case';
import { CalculatePointsUseCase } from '@/src/core/application/use-cases/game-result/calculate-points.use-case';

// Mock the repositories
jest.mock('@/src/core/infrastructure/repositories/amplify-player.repository');
jest.mock('@/src/core/infrastructure/repositories/amplify-game-result.repository');

describe('DIContainer', () => {
  let diContainer: DIContainer;

  beforeEach(() => {
    diContainer = DIContainer.getInstance();
    diContainer.reset();
  });

  afterEach(() => {
    diContainer.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DIContainer.getInstance();
      const instance2 = DIContainer.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should return the same instance from convenience function', () => {
      const instance1 = container();
      const instance2 = container();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(DIContainer.getInstance());
    });
  });

  describe('Repository Management', () => {
    it('should create and return player repository', () => {
      const repo1 = diContainer.playerRepository;
      const repo2 = diContainer.playerRepository;

      expect(repo1).toBeDefined();
      expect(repo1).toBe(repo2); // Should return same instance
    });

    it('should create and return game result repository', () => {
      const repo1 = diContainer.gameResultRepository;
      const repo2 = diContainer.gameResultRepository;

      expect(repo1).toBeDefined();
      expect(repo1).toBe(repo2); // Should return same instance
    });

    it('should allow setting custom player repository', () => {
      const mockRepo: IPlayerRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findMany: jest.fn(),
        findAllActive: jest.fn(),
        exists: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      };

      diContainer.setPlayerRepository(mockRepo);

      expect(diContainer.playerRepository).toBe(mockRepo);
    });

    it('should allow setting custom game result repository', () => {
      const mockRepo: IGameResultRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findMany: jest.fn(),
        findByTournamentId: jest.fn(),
        findByPlayerId: jest.fn(),
        findByPlayerAndTournament: jest.fn(),
        getLeaderboard: jest.fn(),
        getPlayerStats: jest.fn(),
        exists: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      };

      diContainer.setGameResultRepository(mockRepo);

      expect(diContainer.gameResultRepository).toBe(mockRepo);
    });
  });

  describe('Use Case Management', () => {
    it('should create and return CreatePlayerUseCase', () => {
      const useCase1 = diContainer.createPlayerUseCase;
      const useCase2 = diContainer.createPlayerUseCase;

      expect(useCase1).toBeInstanceOf(CreatePlayerUseCase);
      expect(useCase1).toBe(useCase2); // Should return same instance
    });

    it('should create and return UpdatePlayerUseCase', () => {
      const useCase1 = diContainer.updatePlayerUseCase;
      const useCase2 = diContainer.updatePlayerUseCase;

      expect(useCase1).toBeInstanceOf(UpdatePlayerUseCase);
      expect(useCase1).toBe(useCase2); // Should return same instance
    });

    it('should create and return SearchPlayersUseCase', () => {
      const useCase1 = diContainer.searchPlayersUseCase;
      const useCase2 = diContainer.searchPlayersUseCase;

      expect(useCase1).toBeInstanceOf(SearchPlayersUseCase);
      expect(useCase1).toBe(useCase2); // Should return same instance
    });

    it('should create and return CreateGameResultUseCase', () => {
      const useCase1 = diContainer.createGameResultUseCase;
      const useCase2 = diContainer.createGameResultUseCase;

      expect(useCase1).toBeInstanceOf(CreateGameResultUseCase);
      expect(useCase1).toBe(useCase2); // Should return same instance
    });

    it('should create and return CalculatePointsUseCase', () => {
      const useCase1 = diContainer.calculatePointsUseCase;
      const useCase2 = diContainer.calculatePointsUseCase;

      expect(useCase1).toBeInstanceOf(CalculatePointsUseCase);
      expect(useCase1).toBe(useCase2); // Should return same instance
    });
  });

  describe('Dependency Injection', () => {
    it('should inject player repository into player use cases', () => {
      const mockRepo: IPlayerRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findMany: jest.fn(),
        findAllActive: jest.fn(),
        exists: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      };

      diContainer.setPlayerRepository(mockRepo);

      const createUseCase = diContainer.createPlayerUseCase;
      const updateUseCase = diContainer.updatePlayerUseCase;
      const searchUseCase = diContainer.searchPlayersUseCase;

      // Verify that use cases are using the injected repository
      expect((createUseCase as any).playerRepository).toBe(mockRepo);
      expect((updateUseCase as any).playerRepository).toBe(mockRepo);
      expect((searchUseCase as any).playerRepository).toBe(mockRepo);
    });

    it('should inject repositories into CreateGameResultUseCase', () => {
      const mockPlayerRepo: IPlayerRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findMany: jest.fn(),
        findAllActive: jest.fn(),
        exists: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      };

      const mockGameResultRepo: IGameResultRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findMany: jest.fn(),
        findByTournamentId: jest.fn(),
        findByPlayerId: jest.fn(),
        findByPlayerAndTournament: jest.fn(),
        getLeaderboard: jest.fn(),
        getPlayerStats: jest.fn(),
        exists: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      };

      diContainer.setPlayerRepository(mockPlayerRepo);
      diContainer.setGameResultRepository(mockGameResultRepo);

      const createGameResultUseCase = diContainer.createGameResultUseCase;

      // Verify that use case is using the injected repositories
      expect((createGameResultUseCase as any).gameResultRepository).toBe(mockGameResultRepo);
      expect((createGameResultUseCase as any).playerRepository).toBe(mockPlayerRepo);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all instances when reset is called', () => {
      // Get initial instances
      const playerRepo1 = diContainer.playerRepository;
      const createUseCase1 = diContainer.createPlayerUseCase;

      // Reset container
      diContainer.reset();

      // Get new instances
      const playerRepo2 = diContainer.playerRepository;
      const createUseCase2 = diContainer.createPlayerUseCase;

      // Should be different instances
      expect(playerRepo2).not.toBe(playerRepo1);
      expect(createUseCase2).not.toBe(createUseCase1);
    });

    it('should reset dependent use cases when repository is changed', () => {
      // Get initial use case
      const createUseCase1 = diContainer.createPlayerUseCase;

      // Set new repository
      const mockRepo: IPlayerRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findMany: jest.fn(),
        findAllActive: jest.fn(),
        exists: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      };

      diContainer.setPlayerRepository(mockRepo);

      // Get use case again
      const createUseCase2 = diContainer.createPlayerUseCase;

      // Should be different instance with new repository
      expect(createUseCase2).not.toBe(createUseCase1);
      expect((createUseCase2 as any).playerRepository).toBe(mockRepo);
    });

    it('should reset game result dependent use cases when game result repository is changed', () => {
      // Get initial use case
      const createGameResultUseCase1 = diContainer.createGameResultUseCase;

      // Set new repository
      const mockRepo: IGameResultRepository = {
        save: jest.fn(),
        findById: jest.fn(),
        findMany: jest.fn(),
        findByTournamentId: jest.fn(),
        findByPlayerId: jest.fn(),
        findByPlayerAndTournament: jest.fn(),
        getLeaderboard: jest.fn(),
        getPlayerStats: jest.fn(),
        exists: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      };

      diContainer.setGameResultRepository(mockRepo);

      // Get use case again
      const createGameResultUseCase2 = diContainer.createGameResultUseCase;

      // Should be different instance with new repository
      expect(createGameResultUseCase2).not.toBe(createGameResultUseCase1);
      expect((createGameResultUseCase2 as any).gameResultRepository).toBe(mockRepo);
    });
  });

  describe('Lazy Initialization', () => {
    it('should not create instances until accessed', () => {
      const freshContainer = DIContainer.getInstance();
      freshContainer.reset();

      // Check that private properties are null initially
      expect((freshContainer as any)._playerRepository).toBeNull();
      expect((freshContainer as any)._createPlayerUseCase).toBeNull();

      // Access repository
      const repo = freshContainer.playerRepository;

      // Now repository should be created but use case should still be null
      expect((freshContainer as any)._playerRepository).toBe(repo);
      expect((freshContainer as any)._createPlayerUseCase).toBeNull();

      // Access use case
      const useCase = freshContainer.createPlayerUseCase;

      // Now use case should also be created
      expect((freshContainer as any)._createPlayerUseCase).toBe(useCase);
    });
  });
});
