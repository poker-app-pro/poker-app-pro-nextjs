import { container } from '@/src/infrastructure/di/container';
import { LeagueFacade } from '@/src/application-facade/implementations/league.facade';
import { SeriesFacade } from '@/src/application-facade/implementations/series.facade';
import { setLeagueFacade } from '@/src/presentation/adapters/nextjs/controllers/league.controller';
import { setSeriesFacade } from '@/src/presentation/adapters/nextjs/controllers/series.controller';
import { ILeagueRepository } from '@/src/core/domain/repositories/league.repository';

// Create a temporary league repository implementation
// This should be replaced with a proper implementation in the future
const tempLeagueRepository: ILeagueRepository = {
  create: async (league) => {
    // Implementation using cookieBasedClient
    return league;
  },
  update: async (league) => {
    // Implementation using cookieBasedClient
    return league;
  },
  delete: async (_id) => {
    // Implementation using cookieBasedClient
  },
  findById: async (_id) => {
    // Implementation using cookieBasedClient
    return null;
  },
  findAll: async () => {
    // Implementation using cookieBasedClient
    return [];
  },
  findByName: async (_name) => {
    // Implementation using cookieBasedClient
    return [];
  },
  findByOwnerId: async (_ownerId) => {
    // Implementation using cookieBasedClient
    return [];
  },
  findActive: async () => {
    // Implementation using cookieBasedClient
    return [];
  },
  exists: async (_id) => {
    // Implementation using cookieBasedClient
    return false;
  }
};

// Initialize facades with repositories
const leagueFacade = new LeagueFacade(
  tempLeagueRepository,
  container().authService
);

const seriesFacade = new SeriesFacade(
  container().seriesRepository,
  container().authService
);

// Set facades in controllers
// This ensures the facades are set before any controllers are used
setLeagueFacade(leagueFacade);
(async () => {
  await setSeriesFacade(seriesFacade);
})();

console.log('DI setup complete: Facades initialized and set in controllers');

export { container };
