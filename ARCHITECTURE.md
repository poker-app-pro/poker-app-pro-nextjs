# Clean Architecture Refactoring - Poker App Pro

This document outlines the refactored architecture of the Poker App Pro application, implementing Clean Architecture, Onion Architecture, and Vertical Slice Architecture principles while isolating Next.js dependencies for future framework flexibility.

## Architecture Overview

The application has been restructured into distinct layers following the Onion Architecture pattern:

```
src/
├── core/                           # Core Business Logic (Framework Agnostic)
│   ├── domain/                     # Domain Layer (Innermost)
│   │   ├── entities/               # Domain Entities
│   │   ├── repositories/           # Repository Interfaces
│   │   └── services/               # Domain Services Interfaces
│   └── application/                # Application Layer
│       └── use-cases/              # Use Cases (Business Logic)
├── infrastructure/                 # Infrastructure Layer
│   ├── repositories/               # Repository Implementations
│   ├── services/                   # Service Implementations
│   └── di/                         # Dependency Injection Container
└── adapters/                       # Framework Adapters (Outermost)
    └── nextjs/                     # Next.js Specific Code
        ├── actions/                # Server Actions
        ├── components/             # Framework Components
        └── *.adapter.ts            # Framework Adapters
```

## Layer Responsibilities

### 1. Domain Layer (`src/core/domain/`)
- **Purpose**: Contains the core business logic and rules
- **Dependencies**: None (completely isolated)
- **Contents**:
  - **Entities**: Core business objects (League, Player, Tournament)
  - **Repository Interfaces**: Contracts for data access
  - **Domain Services**: Business logic that doesn't belong to entities
  - **Domain Events**: Events that represent business occurrences

### 2. Application Layer (`src/core/application/`)
- **Purpose**: Orchestrates business operations
- **Dependencies**: Only depends on Domain layer
- **Contents**:
  - **Use Cases**: Application-specific business rules
  - **Command/Query Handlers**: Handle specific operations
  - **DTOs**: Data Transfer Objects for use case inputs/outputs

### 3. Infrastructure Layer (`src/infrastructure/`)
- **Purpose**: Implements technical concerns
- **Dependencies**: Depends on Domain and Application layers
- **Contents**:
  - **Repository Implementations**: Concrete data access implementations
  - **Service Implementations**: Technical service implementations
  - **Dependency Injection**: Container for managing dependencies

### 4. Adapter Layer (`src/adapters/`)
- **Purpose**: Isolates framework-specific code
- **Dependencies**: Can depend on all other layers
- **Contents**:
  - **Framework Adapters**: Translate between framework and core
  - **Server Actions**: Next.js specific server actions
  - **Components**: Framework-specific UI components

## Key Principles Implemented

### 1. Clean Architecture
- **Dependency Rule**: Dependencies point inward only
- **Framework Independence**: Core business logic is isolated from frameworks
- **Testability**: Each layer can be tested independently
- **UI Independence**: Business logic doesn't depend on UI

### 2. Onion Architecture
- **Layered Structure**: Clear separation of concerns
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Interface Segregation**: Small, focused interfaces

### 3. Vertical Slice Architecture
- **Feature-Based Organization**: Code organized by business features
- **Minimal Coupling**: Features are loosely coupled
- **High Cohesion**: Related code is grouped together

## Framework Isolation Strategy

### Current Implementation (Next.js)
The application currently uses Next.js but is structured to allow easy migration to other frameworks:

1. **Adapter Pattern**: Framework-specific code is isolated in adapters
2. **Dependency Injection**: Core logic receives dependencies through interfaces
3. **Clean Interfaces**: Framework adapters implement clean, framework-agnostic interfaces

### Migration to Other Frameworks
To migrate to a different framework (e.g., Express, Fastify, SvelteKit):

1. Create new adapter directory: `src/adapters/express/`
2. Implement framework-specific adapters
3. Initialize the DI container with framework-specific implementations
4. The core business logic remains unchanged

## Example: League Feature Implementation

### Domain Entity
```typescript
// src/core/domain/entities/league.entity.ts
export interface LeagueEntity {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  // ... other properties
}
```

### Repository Interface
```typescript
// src/core/domain/repositories/league.repository.ts
export interface LeagueRepository {
  findById(id: string): Promise<LeagueEntity | null>;
  create(request: CreateLeagueRequest): Promise<LeagueEntity>;
  // ... other methods
}
```

### Use Case
```typescript
// src/core/application/use-cases/league/create-league.use-case.ts
export class CreateLeagueUseCaseImpl implements CreateLeagueUseCase {
  constructor(
    private readonly leagueRepository: LeagueRepository,
    private readonly eventPublisher: DomainEventPublisher,
    // ... other dependencies
  ) {}

  async execute(request: CreateLeagueRequest): Promise<CreateLeagueResult> {
    // Business logic implementation
  }
}
```

### Infrastructure Implementation
```typescript
// src/infrastructure/repositories/amplify-league.repository.ts
export class AmplifyLeagueRepository implements LeagueRepository {
  constructor(private readonly client: AmplifyDataClient) {}
  
  async findById(id: string): Promise<LeagueEntity | null> {
    // Amplify-specific implementation
  }
}
```

### Framework Adapter
```typescript
// src/adapters/nextjs/league.adapter.ts
export class NextJSLeagueAdapter {
  static async createLeague(formData: FormData): Promise<LeagueActionResult> {
    const container = getContainer();
    const createLeagueUseCase = container.getCreateLeagueUseCase();
    // Framework-specific form handling
    return await createLeagueUseCase.execute(request);
  }
}
```

### Server Action
```typescript
// src/adapters/nextjs/actions/league.actions.ts
"use server"
export async function createLeague(formData: FormData) {
  return await NextJSLeagueAdapter.createLeague(formData);
}
```

## Benefits of This Architecture

### 1. Maintainability
- Clear separation of concerns
- Easy to locate and modify code
- Reduced coupling between components

### 2. Testability
- Each layer can be tested in isolation
- Easy to mock dependencies
- Business logic is framework-independent

### 3. Flexibility
- Easy to swap implementations
- Framework migration is straightforward
- New features follow established patterns

### 4. Scalability
- Clear boundaries for team collaboration
- Easy to add new features
- Consistent patterns across the application

## Migration Strategy

### Phase 1: Core Domain (Completed)
- ✅ Define domain entities
- ✅ Create repository interfaces
- ✅ Implement domain services

### Phase 2: Application Layer (Completed)
- ✅ Implement use cases
- ✅ Create application services
- ✅ Set up dependency injection

### Phase 3: Infrastructure Layer (Completed)
- ✅ Implement Amplify repositories
- ✅ Create service implementations
- ✅ Configure DI container

### Phase 4: Framework Adapters (Completed)
- ✅ Create Next.js adapters
- ✅ Implement server actions
- ✅ Update components

### Phase 5: Complete Migration (Next Steps)
- [ ] Migrate all entities (Player, Tournament, Season, etc.)
- [ ] Implement remaining use cases
- [ ] Update all components to use new architecture
- [ ] Add comprehensive testing
- [ ] Performance optimization

## Testing Strategy

### Unit Tests
- Domain entities and business logic
- Use cases with mocked dependencies
- Repository implementations

### Integration Tests
- Use cases with real repositories
- End-to-end feature testing
- Database integration tests

### Framework Tests
- Adapter functionality
- Server action behavior
- Component integration

## Performance Considerations

### Caching Strategy
- Repository-level caching
- Use case result caching
- Framework-specific optimizations

### Lazy Loading
- Dependency injection with lazy initialization
- Dynamic imports for large features
- Component-level code splitting

## Security Considerations

### Input Validation
- Domain-level validation rules
- Use case input validation
- Framework adapter sanitization

### Authorization
- Domain-level authorization rules
- Use case permission checks
- Framework-specific auth integration

## Conclusion

This refactored architecture provides a solid foundation for the Poker App Pro application, ensuring maintainability, testability, and flexibility for future growth and framework changes. The clear separation of concerns and dependency inversion make the codebase more robust and easier to work with.
