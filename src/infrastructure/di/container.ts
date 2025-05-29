import { IPlayerRepository } from '@/src/core/domain/repositories/player.repository';
import { IGameResultRepository } from '@/src/core/domain/repositories/game-result.repository';
import { ISeriesRepository } from '@/src/core/domain/repositories/series.repository';
import { AmplifyPlayerRepository } from '@/src/infrastructure/repositories/amplify-player.repository';
import { AmplifyGameResultRepository } from '@/src/infrastructure/repositories/amplify-game-result.repository';
import { AmplifySeriesRepository } from '@/src/infrastructure/repositories/amplify-series.repository';

import { CreatePlayerUseCase } from '@/src/core/application/use-cases/player/create-player.use-case';
import { UpdatePlayerUseCase } from '@/src/core/application/use-cases/player/update-player.use-case';
import { SearchPlayersUseCase } from '@/src/core/application/use-cases/player/search-players.use-case';
import { CreateGameResultUseCase } from '@/src/core/application/use-cases/game-result/create-game-result.use-case';
import { CalculatePointsUseCase } from '@/src/core/application/use-cases/game-result/calculate-points.use-case';

import { IAuthService, AmplifyAuthService } from '@/src/infrastructure/services/amplify-auth.service';
import { IAmplifyClientService, AmplifyClientService } from '@/src/infrastructure/services/amplify-client.service';

// Facade imports
// import { ISeriesFacade } from '@/src/application-facade/interfaces/ISeriesFacade';
// import { ILeagueFacade } from '@/src/application-facade/interfaces/ILeagueFacade';
// import { SeriesFacade, LeagueFacade } from '@/src/application-facade/implementations';

/**
 * Dependency Injection Container
 * Manages the creation and lifecycle of dependencies
 */
export class DIContainer {
  private static instance: DIContainer;

  // Repository instances
  private _playerRepository: IPlayerRepository | null = null;
  private _gameResultRepository: IGameResultRepository | null = null;
  private _seriesRepository: ISeriesRepository | null = null;

  // Service instances
  private _authService: IAuthService | null = null;
  private _amplifyClientService: IAmplifyClientService | null = null;

  // Facade instances
  // private _seriesFacade: ISeriesFacade | null = null;
  // private _leagueFacade: ILeagueFacade | null = null;

  // Use case instances
  private _createPlayerUseCase: CreatePlayerUseCase | null = null;
  private _updatePlayerUseCase: UpdatePlayerUseCase | null = null;
  private _searchPlayersUseCase: SearchPlayersUseCase | null = null;
  private _createGameResultUseCase: CreateGameResultUseCase | null = null;
  private _calculatePointsUseCase: CalculatePointsUseCase | null = null;

  private constructor() { }

  /**
   * Get singleton instance
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Repository Getters
   */
  get playerRepository(): IPlayerRepository {
    if (!this._playerRepository) {
      this._playerRepository = new AmplifyPlayerRepository();
    }
    return this._playerRepository;
  }

  get gameResultRepository(): IGameResultRepository {
    if (!this._gameResultRepository) {
      this._gameResultRepository = new AmplifyGameResultRepository();
    }
    return this._gameResultRepository;
  }

  get seriesRepository(): ISeriesRepository {
    if (!this._seriesRepository) {
      this._seriesRepository = new AmplifySeriesRepository();
    }
    return this._seriesRepository;
  }

  /**
   * Service Getters
   */
  get authService(): IAuthService {
    if (!this._authService) {
      this._authService = new AmplifyAuthService();
    }
    return this._authService;
  }

  get amplifyClientService(): IAmplifyClientService {
    if (!this._amplifyClientService) {
      this._amplifyClientService = AmplifyClientService.getInstance();
    }
    return this._amplifyClientService;
  }

  /**
   * Facade Getters
   */
  // get seriesFacade(): ISeriesFacade {
  //   if (!this._seriesFacade) {
  //     this._seriesFacade = new SeriesFacade(
  //       this.seriesRepository,
  //       this.authService
  //     );
  //   }
  //   return this._seriesFacade;
  // }

  // get leagueFacade(): ILeagueFacade {
  //   if (!this._leagueFacade) {
  //     // Note: We'll need to add league repository when it's implemented
  //     this._leagueFacade = new LeagueFacade(
  //       {} as any, // TODO: Replace with actual league repository
  //       this.authService
  //     );
  //   }
  //   return this._leagueFacade;
  // }

  /**
   * Use Case Getters
   */
  get createPlayerUseCase(): CreatePlayerUseCase {
    if (!this._createPlayerUseCase) {
      this._createPlayerUseCase = new CreatePlayerUseCase(this.playerRepository);
    }
    return this._createPlayerUseCase;
  }

  get updatePlayerUseCase(): UpdatePlayerUseCase {
    if (!this._updatePlayerUseCase) {
      this._updatePlayerUseCase = new UpdatePlayerUseCase(this.playerRepository);
    }
    return this._updatePlayerUseCase;
  }

  get searchPlayersUseCase(): SearchPlayersUseCase {
    if (!this._searchPlayersUseCase) {
      this._searchPlayersUseCase = new SearchPlayersUseCase(this.playerRepository);
    }
    return this._searchPlayersUseCase;
  }

  get createGameResultUseCase(): CreateGameResultUseCase {
    if (!this._createGameResultUseCase) {
      this._createGameResultUseCase = new CreateGameResultUseCase(
        this.gameResultRepository,
        this.playerRepository
      );
    }
    return this._createGameResultUseCase;
  }

  get calculatePointsUseCase(): CalculatePointsUseCase {
    if (!this._calculatePointsUseCase) {
      this._calculatePointsUseCase = new CalculatePointsUseCase();
    }
    return this._calculatePointsUseCase;
  }

  /**
   * Reset all instances (useful for testing)
   */
  reset(): void {
    this._playerRepository = null;
    this._gameResultRepository = null;
    this._seriesRepository = null;
    this._authService = null;
    this._amplifyClientService = null;
    // this._seriesFacade = null;
    // this._leagueFacade = null;
    this._createPlayerUseCase = null;
    this._updatePlayerUseCase = null;
    this._searchPlayersUseCase = null;
    this._createGameResultUseCase = null;
    this._calculatePointsUseCase = null;
  }

  /**
   * Override repositories (useful for testing with mocks)
   */
  setPlayerRepository(repository: IPlayerRepository): void {
    this._playerRepository = repository;
    // Reset dependent use cases
    this._createPlayerUseCase = null;
    this._updatePlayerUseCase = null;
    this._searchPlayersUseCase = null;
    this._createGameResultUseCase = null;
  }

  setGameResultRepository(repository: IGameResultRepository): void {
    this._gameResultRepository = repository;
    // Reset dependent use cases
    this._createGameResultUseCase = null;
  }

  setSeriesRepository(repository: ISeriesRepository): void {
    this._seriesRepository = repository;
    // Reset dependent facades
    // this._seriesFacade = null;
  }

  setAuthService(service: IAuthService): void {
    this._authService = service;
    // Reset dependent facades
    // this._seriesFacade = null;
    // this._leagueFacade = null;
  }

  setAmplifyClientService(service: IAmplifyClientService): void {
    this._amplifyClientService = service;
  }

  /**
   * Override facades (useful for testing with mocks)
   */
  // setSeriesFacade(facade: ISeriesFacade): void {
  //   this._seriesFacade = facade;
  // }

  // setLeagueFacade(facade: ILeagueFacade): void {
  //   this._leagueFacade = facade;
  // }
}

/**
 * Convenience function to get the DI container instance
 */
export const container = () => DIContainer.getInstance();
