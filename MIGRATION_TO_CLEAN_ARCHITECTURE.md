# Migration to Clean Architecture - Progress Report

## Overview
This document tracks the migration of code from outside the `src` directory into the clean onion architecture within the `src` directory.

## Current Clean Architecture Structure

```
src/
├── core/                           # Core business logic (innermost layer)
│   ├── domain/                     # Domain layer - entities, value objects, repositories
│   │   ├── entities/               # Business entities
│   │   ├── value-objects/          # Value objects
│   │   ├── repositories/           # Repository interfaces
│   │   └── services/               # Domain services
│   └── application/                # Application layer - use cases, DTOs
│       ├── use-cases/              # Application use cases
│       └── dtos/                   # Data transfer objects
└── infrastructure/                 # Infrastructure layer (outermost layer)
    ├── repositories/               # Repository implementations
    ├── services/                   # External service implementations
    └── di/                         # Dependency injection container
```

## Migration Progress

### ✅ COMPLETED

#### 1. Core Domain Layer
- **Entities**: All business entities properly structured
  - `Player`, `GameResult`, `Series`, `Season`, `League`, `Tournament`
- **Value Objects**: All value objects implemented
  - `GameTime`, `Position`, `Points`, `Money`
- **Repository Interfaces**: All repository contracts defined
- **Domain Services**: Core business logic services

#### 2. Application Layer
- **Use Cases**: Application business logic
- **DTOs**: Data transfer objects for API boundaries

#### 3. Infrastructure Layer - Repositories
- ✅ `AmplifyPlayerRepository` - Complete implementation
- ✅ `AmplifyGameResultRepository` - Complete implementation (needs Amplify schema fixes)
- ✅ `AmplifySeriesRepository` - Complete implementation (needs interface alignment)
- 🔄 Additional repositories needed for other entities

#### 4. Dependency Injection
- ✅ `Container` class implemented with repository registration
- ✅ Singleton pattern for repository instances

#### 5. Import Path Standardization
- ✅ All relative imports converted to absolute `@/src/` paths
- ✅ Consistent import structure across all files

### 🔄 IN PROGRESS / NEEDS ATTENTION

#### 1. Amplify Schema Alignment
**Issue**: Repository implementations reference Amplify models that may not exist or have different names
- `AmplifyGameResultRepository` references `Result` model - needs verification
- `AmplifySeriesRepository` has field mismatches with Amplify schema
- Need to check actual Amplify schema in `amplify/data/resource.ts`

#### 2. Repository Interface Completeness
**Issue**: Some repository implementations missing required interface methods
- `AmplifySeriesRepository` missing: `create`, `update`, `findCurrentlyActive`, `findByDateRange`
- Need to complete all interface implementations

#### 3. Code Outside src/ Directory Still Present

#### Files in Root Directory:
- `middleware.ts` - Next.js middleware (should stay in root)
- Configuration files (should stay in root)

#### Files in app/ Directory:
- `app/__actions/` - Server actions that need migration
  - `league.ts`, `players.ts`, `qualification.ts`, `results.ts`, `seasons.ts`, `series.ts`, `standings.ts`
- `app/api/` - API routes (Next.js App Router structure - should stay)
- `app/(root)/` - Page components (Next.js App Router structure - should stay)
- `app/auth/` - Auth pages (Next.js App Router structure - should stay)

#### Files in components/ Directory:
- UI components and layout components
- These should potentially be moved to `src/presentation/` layer

#### Files in contexts/ Directory:
- React contexts for state management
- These should potentially be moved to `src/presentation/` layer

#### Files in lib/ Directory:
- Utility functions and hooks
- These should be evaluated and potentially moved to appropriate `src/` layers

### 📋 NEXT STEPS

#### Priority 1: Fix Current Implementation Issues
1. **Verify Amplify Schema**
   - Check `amplify/data/resource.ts` for actual model names and fields
   - Update repository implementations to match schema

2. **Complete Repository Interfaces**
   - Implement missing methods in `AmplifySeriesRepository`
   - Ensure all repositories fully implement their interfaces

3. **Fix TypeScript Errors**
   - Resolve remaining type mismatches
   - Ensure all imports are correctly resolved

#### Priority 2: Migrate Server Actions
1. **Analyze app/__actions/ files**
   - Determine which logic belongs in use cases vs. infrastructure
   - Create corresponding use cases in `src/core/application/use-cases/`
   - Create infrastructure services in `src/infrastructure/services/`

2. **Update Server Actions**
   - Refactor to use dependency injection container
   - Make them thin wrappers around use cases

#### Priority 3: Presentation Layer
1. **Create src/presentation/ layer**
   - Move components from `components/` to `src/presentation/components/`
   - Move contexts from `contexts/` to `src/presentation/contexts/`
   - Move hooks from `lib/hooks/` to `src/presentation/hooks/`

2. **Update Import Paths**
   - Update all imports in app/ directory to use new paths
   - Ensure clean separation between presentation and core layers

#### Priority 4: Infrastructure Services
1. **Create External Service Implementations**
   - Authentication services
   - Email services
   - File upload services
   - Any other external integrations

### 🎯 BENEFITS ACHIEVED

1. **Clean Separation of Concerns**
   - Business logic isolated in core domain
   - Infrastructure concerns separated
   - Clear dependency direction (inward)

2. **Testability**
   - Repository interfaces allow easy mocking
   - Use cases can be tested independently
   - Domain logic is pure and testable

3. **Maintainability**
   - Consistent import paths
   - Clear file organization
   - Dependency injection for loose coupling

4. **Scalability**
   - Easy to add new features following established patterns
   - Infrastructure can be swapped without affecting business logic
   - Clear boundaries between layers

### 🚨 CURRENT BLOCKERS

1. **TypeScript Errors**: Need to resolve schema mismatches before proceeding
2. **Missing Repository Methods**: Complete interface implementations
3. **Amplify Schema Verification**: Ensure repository implementations match actual schema

### 📝 NOTES

- The migration maintains Next.js App Router structure for pages and API routes
- Configuration files remain in root as per Next.js conventions
- Focus is on business logic migration to clean architecture
- Presentation layer migration can be done incrementally
