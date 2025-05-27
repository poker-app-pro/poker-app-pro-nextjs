// Domain Services - Pure business logic interfaces
// These are framework-agnostic and define contracts for cross-cutting concerns

// Domain Event System
export interface DomainEvent {
  readonly type: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;
  readonly eventData: Record<string, unknown>;
}

export interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export interface DomainEventPublisher {
  publish<T extends DomainEvent>(event: T): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: DomainEventHandler<T>): void;
}

// Activity Logging Service
export interface ActivityLogService {
  logActivity(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, unknown>
  ): Promise<void>;
}

// Validation Service
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationService {
  validateLeagueName(name: string): ValidationResult;
  validateEmail(email: string): ValidationResult;
  validateUserId(userId: string): ValidationResult;
}
