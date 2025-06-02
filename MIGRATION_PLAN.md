# Comprehensive Migration Plan for CLEAN Architecture

Based on the grep command results, I've identified 43 files that need to be migrated to the new src directory following CLEAN architecture principles. Here's a detailed plan to approach this migration file by file:

## 1. Understanding the Current Structure vs. Target Structure

I notice you already have a src directory with CLEAN architecture folders:
- src/core (domain and application layers)
- src/infrastructure (repositories, services)
- src/presentation (components, adapters)
- src/application-facade (interfaces and implementations)

## 2. Migration Approach by File Category

### A. Action Files Migration (7 files)
First, I'll migrate the action files which likely contain business logic:

1. **app/__actions/league.ts** → Move to src/core/application/usecases
2. **app/__actions/players.ts** → Move to src/core/application/usecases
3. **app/__actions/qualification.ts** → Move to src/core/application/usecases
4. **app/__actions/results.ts** → Move to src/core/application/usecases
5. **app/__actions/seasons.ts** → Move to src/core/application/usecases
6. **app/__actions/series.ts** → Move to src/core/application/usecases
7. **app/__actions/standings.ts** → Move to src/core/application/usecases

For each file:
- Extract domain entities to src/core/domain/entities
- Extract business logic to src/core/application/usecases
- Create interfaces in src/core/application/ports
- Implement repositories in src/infrastructure/repositories

### B. API Routes Migration (1 file)
8. **app/api/players/search/route.ts** → Move to src/infrastructure/api

### C. Auth Pages Migration (6 files)
9. **app/auth/create-profile/page.tsx** → Move to src/presentation/pages/auth
10. **app/auth/forgot-password/page.tsx** → Move to src/presentation/pages/auth
11. **app/auth/login/page.tsx** → Move to src/presentation/pages/auth
12. **app/auth/reset-password/page.tsx** → Move to src/presentation/pages/auth
13. **app/auth/signup/page.tsx** → Move to src/presentation/pages/auth
14. **app/auth/verify/page.tsx** → Move to src/presentation/pages/auth

### D. App Layout and Pages (5 files)
15. **app/layout.tsx** → Move to src/presentation/layouts
16. **app/page.tsx** → Move to src/presentation/pages
17. **app/(root)/layout.tsx** → Move to src/presentation/layouts
18. **app/(root)/dashboard/layout.tsx** → Move to src/presentation/layouts/dashboard
19. **app/(root)/dashboard/page.tsx** → Move to src/presentation/pages/dashboard

### E. Feature Pages (24 files)
For each feature (leagues, players, etc.):
- Move page components to src/presentation/pages/{feature}
- Extract business logic to src/core/application/usecases/{feature}
- Create domain entities in src/core/domain/entities
- Implement repositories in src/infrastructure/repositories/{feature}

## 3. Step-by-Step Migration Process for Each File

For each file, I'll follow this process:

1. **Analyze the file**:
   - Identify imports, dependencies, and functionality
   - Determine which CLEAN architecture layer it belongs to

2. **Extract domain entities**:
   - Identify data structures and business rules
   - Create entity classes in src/core/domain/entities

3. **Extract use cases**:
   - Identify business logic operations
   - Create use case classes in src/core/application/usecases

4. **Define interfaces**:
   - Create repository interfaces in src/core/application/ports
   - Define service interfaces if needed

5. **Implement infrastructure**:
   - Create repository implementations in src/infrastructure/repositories
   - Implement services in src/infrastructure/services

6. **Create presentation components**:
   - Move UI components to src/presentation/components
   - Adapt pages to use the new architecture in src/presentation/pages

7. **Update imports**:
   - Change all imports to use the new file structure
   - Use '@/src/...' path format

8. **Test the migration**:
   - Ensure functionality works as expected
   - Fix any issues that arise

## 4. Dependency Injection Setup

- Update the DI container in src/infrastructure/di
- Register all repositories, services, and use cases
- Configure the application facade to expose the functionality

## 5. Migration Order

I recommend migrating in this order:
1. Domain entities (establish the core model)
2. Application interfaces (define the contracts)
3. Infrastructure implementations (implement data access)
4. Action files (business logic)
5. API routes (data access points)
6. Page components (UI layer)

Would you like me to start with a detailed analysis of any specific file to demonstrate the migration process? Or would you prefer I outline the migration steps for a particular category of files first?