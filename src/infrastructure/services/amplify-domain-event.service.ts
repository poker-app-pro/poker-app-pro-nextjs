import { 
  DomainEvent, 
  DomainEventHandler, 
  DomainEventPublisher, 
  ActivityLogService,
  ValidationService,
  ValidationResult
} from '../../core/domain/services/domain-event.service';
import { AmplifyActivityLogClient } from '../types/amplify.types';

export class InMemoryDomainEventPublisher implements DomainEventPublisher {
  private handlers = new Map<string, DomainEventHandler<DomainEvent>[]>();

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const eventHandlers = this.handlers.get(event.type) || [];
    
    // Execute all handlers for this event type
    await Promise.all(
      eventHandlers.map(handler => handler.handle(event))
    );
  }

  subscribe<T extends DomainEvent>(
    eventType: string, 
    handler: DomainEventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    this.handlers.get(eventType)!.push(handler as DomainEventHandler<DomainEvent>);
  }
}

export class AmplifyActivityLogService implements ActivityLogService {
  constructor(private readonly client: AmplifyActivityLogClient) {}

  async logActivity(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.client.models.ActivityLog.create(
        {
          userId,
          action,
          entityType,
          entityId,
          details,
          timestamp: new Date().toISOString()
        },
        { authMode: "userPool" }
      );
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging should not break the main flow
    }
  }
}

export class DefaultValidationService implements ValidationService {
  validateLeagueName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('League name is required');
    }

    if (name && name.trim().length < 2) {
      errors.push('League name must be at least 2 characters long');
    }

    if (name && name.trim().length > 100) {
      errors.push('League name must be less than 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateUserId(userId: string): ValidationResult {
    const errors: string[] = [];

    if (!userId || userId.trim().length === 0) {
      errors.push('User ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
