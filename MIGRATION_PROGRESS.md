# Clean Architecture Migration Progress

## Overview
This document tracks the progress of migrating code from outside the `src` directory into a clean onion architecture with maximum framework isolation.

## Completed Work

### Phase 1: Domain Layer Expansion ✅
- **New Entities Created:**
  - `League` - Represents poker leagues
  - `Season` - Represents seasons within leagues
  - `Series` - Represents tournament series within seasons
  - `Tournament` - Represents individual tournaments
  - `Qualification` - Represents player qualifications for events
  - `Scoreboard` - Represents player standings in series

- **Value Objects Enhanced:**
  - Added `daysBetween()` method to `GameTime`
  - Added `subtract()` method to `Points`

- **Repository Interfaces Created:**
  - `ILeagueRepository`
  - `ISeasonRepository`
  - `ISeriesRepository`
  - `ITournamentRepository`
  - `IQualificationRepository`
  - `IScoreboardRepository`

### Phase 2: Application Layer Foundation ✅
- **DTOs Created:**
  - `league.dto.ts` - Complete league data transfer objects
  - `season.dto.ts` - Complete season data transfer objects

### Phase 3: Framework Isolation Architecture ✅
- **Application Facade Layer:**
  - Created `src/application-facade/` directory structure
  - `ILeagueFacade` interface for framework-agnostic league operations

- **Presentation Layer with Framework Isolation:**
  - Created `src/presentation/adapters/nextjs/controllers/` structure
  - `league.controller.ts` - Next.js specific server actions that call facades

## Architecture Benefits Achieved

### 1. Complete Framework Independence
- Core business logic has zero framework dependencies
- Domain entities contain pure business rules
- Repository interfaces define contracts without implementation details

### 2. Easy Framework Replacement
- Next.js code isolated to `src/presentation/adapters/nextjs/`
- To replace Next.js: Only change the adapter layer
- Core business logic remains untouched

### 3. Clean Data Flow
```
Next.js Controller → Facade → Application Service → Domain Entity
```

### 4. Dependency Inversion
- Framework code depends on abstractions (facades)
- Core business logic defines interfaces
- Infrastructure implements interfaces

## Current Architecture Structure

```
src/
├── core/                           # ✅ COMPLETE
│   ├── domain/
│   │   ├── entities/              # All major entities created
│   │   ├── value-objects/         # Enhanced with new methods
│   │   ├── repositories/          # All repository interfaces
│   │   └── services/              # Domain services
│   └── application/
│       ├── dtos/                  # DTOs for League, Season (more needed)
│       └── use-cases/             # Existing use cases (expansion needed)
├── infrastructure/                 # ⚠️ NEEDS EXPANSION
│   ├── repositories/              # Need new repository implementations
│   ├── services/                  # Need auth and other services
│   └── di/                        # Need container expansion
├── application-facade/             # 🚧 IN PROGRESS
│   ├── interfaces/                # ILeagueFacade created (more needed)
│   └── implementations/           # Need facade implementations
└── presentation/                   # 🚧 IN PROGRESS
    └── adapters/
        ├── nextjs/
        │   ├── controllers/       # League controller created (more needed)
        │   ├── middleware/        # Need to migrate middleware.ts
        │   └── api-routes/        # Need to migrate API routes
        ├── react/                 # Need to migrate components
        └── web/                   # Need to migrate styles/assets
```

## Next Steps (Remaining Work)

### Phase 4: Complete Application Layer
- [ ] Create remaining DTOs (Series, Tournament, Qualification, Scoreboard)
- [ ] Create application services for all entities
- [ ] Migrate existing use cases to new structure

### Phase 5: Infrastructure Layer Expansion
- [ ] Create Amplify repository implementations for new entities
- [ ] Create authentication service
- [ ] Expand DI container with new dependencies
- [ ] Migrate `lib/amplify-utils.ts` into infrastructure

### Phase 6: Complete Application Facades
- [ ] Create facade interfaces for all entities
- [ ] Implement all facade classes
- [ ] Wire facades to application services

### Phase 7: Complete Presentation Layer Migration
- [ ] Migrate all `app/__actions/` to Next.js controllers
- [ ] Migrate `components/` to React adapters
- [ ] Migrate `contexts/` to React adapters
- [ ] Migrate `middleware.ts` to Next.js adapters
- [ ] Migrate `lib/utils.ts` to web utilities

### Phase 8: Framework Replacement Preparation
- [ ] Create framework-agnostic view models
- [ ] Create data mappers between DTOs and view models
- [ ] Document framework replacement process

## Code Outside `src` Directory (To Be Migrated)

### High Priority (Business Logic)
- `app/__actions/` - Server actions (partially migrated)
- `contexts/` - React contexts with business logic
- `middleware.ts` - Authentication middleware

### Medium Priority (Presentation Logic)
- `components/` - React components
- `lib/utils.ts` - Utility functions

### Low Priority (Configuration)
- `amplify/` - AWS Amplify configuration
- Root configuration files

## Migration Strategy

### Current Approach: Bottom-Up
1. ✅ Domain entities and business rules
2. ✅ Repository interfaces
3. 🚧 Application services and facades
4. 🚧 Infrastructure implementations
5. 🚧 Presentation adapters

### Framework Isolation Validation
To test framework isolation, we should be able to:
1. Replace Next.js with SvelteKit by only changing `src/presentation/adapters/`
2. Replace React with Vue by only changing `src/presentation/adapters/react/`
3. Replace Amplify with another backend by only changing `src/infrastructure/`

## Success Metrics
- [ ] Zero framework imports in `src/core/`
- [ ] All business logic accessible through facades
- [ ] All external dependencies injected via interfaces
- [ ] Complete test coverage of domain layer
- [ ] Documentation for framework replacement process

## Notes
- The migration maintains backward compatibility
- Existing code continues to work during migration
- New features should use the clean architecture
- Framework-specific code is clearly isolated and marked
