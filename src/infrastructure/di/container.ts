// Dependency Injection Container
// This isolates framework dependencies and provides clean interfaces

import { LeagueRepository } from '../../core/domain/repositories/league.repository';
import { CreateLeagueUseCase, CreateLeagueUseCaseImpl } from '../../core/application/use-cases/league/create-league.use-case';
import { GetLeaguesUseCase, GetLeaguesUseCaseImpl } from '../../core/application/use-cases/league/get-leagues.use-case';
import { DomainEventPublisher, ActivityLogService, ValidationService } from '../../core/domain/services/domain-event.service';
import { AmplifyLeagueRepository } from '../repositories/amplify-league.repository';
import { 
  InMemoryDomainEventPublisher, 
  AmplifyActivityLogService, 
  DefaultValidationService
} from '../services/amplify-domain-event.service';
import { AmplifyDataClient, AmplifyActivityLogClient } from '../types/amplify.types';

export interface Container {
  // Repositories
  getLeagueRepository(): LeagueRepository;
  
  // Use Cases
  getCreateLeagueUseCase(): CreateLeagueUseCase;
  getGetLeaguesUseCase(): GetLeaguesUseCase;
  
  // Services
  getDomainEventPublisher(): DomainEventPublisher;
  getActivityLogService(): ActivityLogService;
  getValidationService(): ValidationService;
}

export class DIContainer implements Container {
  private leagueRepository?: LeagueRepository;
  private createLeagueUseCase?: CreateLeagueUseCase;
  private getLeaguesUseCase?: GetLeaguesUseCase;
  private domainEventPublisher?: DomainEventPublisher;
  private activityLogService?: ActivityLogService;
  private validationService?: ValidationService;

  constructor(
    private readonly amplifyDataClient: AmplifyDataClient,
    private readonly amplifyActivityLogClient: AmplifyActivityLogClient
  ) {}

  getLeagueRepository(): LeagueRepository {
    if (!this.leagueRepository) {
      this.leagueRepository = new AmplifyLeagueRepository(this.amplifyDataClient);
    }
    return this.leagueRepository;
  }

  getCreateLeagueUseCase(): CreateLeagueUseCase {
    if (!this.createLeagueUseCase) {
      this.createLeagueUseCase = new CreateLeagueUseCaseImpl(
        this.getLeagueRepository(),
        this.getDomainEventPublisher(),
        this.getActivityLogService(),
        this.getValidationService()
      );
    }
    return this.createLeagueUseCase;
  }

  getGetLeaguesUseCase(): GetLeaguesUseCase {
    if (!this.getLeaguesUseCase) {
      this.getLeaguesUseCase = new GetLeaguesUseCaseImpl(
        this.getLeagueRepository()
      );
    }
    return this.getLeaguesUseCase;
  }

  getDomainEventPublisher(): DomainEventPublisher {
    if (!this.domainEventPublisher) {
      this.domainEventPublisher = new InMemoryDomainEventPublisher();
    }
    return this.domainEventPublisher;
  }

  getActivityLogService(): ActivityLogService {
    if (!this.activityLogService) {
      this.activityLogService = new AmplifyActivityLogService(this.amplifyActivityLogClient);
    }
    return this.activityLogService;
  }

  getValidationService(): ValidationService {
    if (!this.validationService) {
      this.validationService = new DefaultValidationService();
    }
    return this.validationService;
  }
}

// Global container instance - will be initialized by the framework adapter
let containerInstance: Container | null = null;

export function initializeContainer(
  amplifyDataClient: AmplifyDataClient,
  amplifyActivityLogClient: AmplifyActivityLogClient
): void {
  containerInstance = new DIContainer(amplifyDataClient, amplifyActivityLogClient);
}

export function getContainer(): Container {
  if (!containerInstance) {
    throw new Error('Container not initialized. Call initializeContainer first.');
  }
  return containerInstance;
}
