import { LeagueRepository } from '../../domain/repositories/league.repository';
import { CreateLeagueRequest, LeagueEntity, LeagueCreatedEvent } from '../../domain/entities/league.entity';
import { DomainEventPublisher, ActivityLogService, ValidationService } from '../../domain/services/domain-event.service';

export interface CreateLeagueUseCase {
  execute(request: CreateLeagueRequest): Promise<CreateLeagueResult>;
}

export interface CreateLeagueResult {
  success: boolean;
  data?: LeagueEntity;
  error?: string;
}

export class CreateLeagueUseCaseImpl implements CreateLeagueUseCase {
  constructor(
    private readonly leagueRepository: LeagueRepository,
    private readonly eventPublisher: DomainEventPublisher,
    private readonly activityLogService: ActivityLogService,
    private readonly validationService: ValidationService
  ) {}

  async execute(request: CreateLeagueRequest): Promise<CreateLeagueResult> {
    try {
      // Validate input
      const nameValidation = this.validationService.validateLeagueName(request.name);
      if (!nameValidation.isValid) {
        return {
          success: false,
          error: nameValidation.errors.join(', ')
        };
      }

      const userIdValidation = this.validationService.validateUserId(request.userId);
      if (!userIdValidation.isValid) {
        return {
          success: false,
          error: userIdValidation.errors.join(', ')
        };
      }

      // Check for duplicate league name for this user
      const existingLeague = await this.leagueRepository.findByName(request.name, request.userId);
      if (existingLeague) {
        return {
          success: false,
          error: 'A league with this name already exists'
        };
      }

      // Create the league
      const league = await this.leagueRepository.create({
        ...request,
        isActive: request.isActive ?? true
      });

      // Publish domain event
      const event: LeagueCreatedEvent = {
        type: 'LeagueCreated',
        leagueId: league.id,
        userId: request.userId,
        name: request.name,
        timestamp: new Date()
      };
      await this.eventPublisher.publish(event);

      // Log activity
      await this.activityLogService.logActivity(
        request.userId,
        'CREATE',
        'League',
        league.id,
        { name: request.name }
      );

      return {
        success: true,
        data: league
      };
    } catch (error) {
      console.error('Error creating league:', error);
      return {
        success: false,
        error: 'Failed to create league'
      };
    }
  }
}
