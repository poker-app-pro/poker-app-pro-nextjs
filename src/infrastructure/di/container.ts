import { ILeagueFacade } from '@/src/application-facade/interfaces/ILeagueFacade';
import { IPlayerFacade } from '@/src/application-facade/interfaces/IPlayerFacade';
import { IQualificationFacade } from '@/src/application-facade/interfaces/IQualificationFacade';
import { IResultsFacade } from '@/src/application-facade/interfaces/IResultsFacade';
import { ISeasonFacade } from '@/src/application-facade/interfaces/ISeasonFacade';
import { ISeriesFacade } from '@/src/application-facade/interfaces/ISeriesFacade';
import { IStandingsFacade } from '@/src/application-facade/interfaces/IStandingsFacade';

import { setLeagueFacade } from '@/src/presentation/adapters/nextjs/controllers/league.controller';
import { setPlayerFacade } from '@/src/presentation/adapters/nextjs/controllers/player.controller';
import { setQualificationFacade } from '@/src/presentation/adapters/nextjs/controllers/qualification.controller';
import { setResultsFacade } from '@/src/presentation/adapters/nextjs/controllers/results.controller';
import { setSeasonFacade } from '@/src/presentation/adapters/nextjs/controllers/season.controller';
import { setSeriesFacade } from '@/src/presentation/adapters/nextjs/controllers/series.controller';
import { setStandingsFacade } from '@/src/presentation/adapters/nextjs/controllers/standings.controller';

// Import facade implementations
import { LeagueFacade } from '@/src/application-facade/implementations/LeagueFacade';
import { PlayerFacade } from '@/src/application-facade/implementations/PlayerFacade';
// Other facade implementations will be imported here

/**
 * Dependency Injection Container
 * This is a simple DI container that registers all the facades and injects them into the controllers
 */
class DIContainer {
  private static instance: DIContainer;
  private initialized = false;

  // Singleton pattern
  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Initialize the DI container
   * This method should be called once during application startup
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('DI container already initialized');
      return;
    }

    console.log('Initializing DI container...');

    try {
      // Create facade instances
      const leagueFacade: ILeagueFacade = new LeagueFacade();
      const playerFacade: IPlayerFacade = new PlayerFacade();
      // Other facade instances will be created here

      // Inject facades into controllers
      await setLeagueFacade(leagueFacade);
      await setPlayerFacade(playerFacade);
      // Other facades will be injected here

      this.initialized = true;
      console.log('DI container initialized successfully');
    } catch (error) {
      console.error('Error initializing DI container:', error);
      throw error;
    }
  }
}

export default DIContainer;
