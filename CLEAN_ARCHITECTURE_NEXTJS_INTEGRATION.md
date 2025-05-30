# Integrating CLEAN Architecture with Next.js

This document outlines how to configure a Next.js application to work with CLEAN architecture, specifically focusing on the integration points between the Next.js app directory structure and the CLEAN architecture layers.

## Architecture Overview

Our application follows the CLEAN architecture pattern with the following layers:

1. **Core Layer**
   - Domain: Contains business entities, interfaces, and domain logic
   - Application: Contains use cases, DTOs, and business rules

2. **Infrastructure Layer**
   - Repositories: Implements data access interfaces defined in the domain layer
   - Services: Implements service interfaces defined in the domain layer
   - DI: Dependency injection container

3. **Application Facade Layer**
   - Facades: Simplifies access to use cases for the presentation layer
   - Interfaces: Defines contracts for facades

4. **Presentation Layer**
   - Adapters: Framework-specific adapters (Next.js controllers)
   - Components: UI components
   - Contexts: React contexts
   - Hooks: Custom React hooks

## Integration Strategy

### 1. Entry Point Configuration

The application's entry point (`app/layout.tsx`) imports the DI setup to ensure all dependencies are properly initialized before any components are rendered:

```tsx
// app/layout.tsx
import "./di-setup"; // Import DI setup to initialize on app startup
```

### 2. Dependency Injection Setup

The DI setup file (`app/di-setup.ts`) initializes all facades and sets them in the controllers:

```typescript
// app/di-setup.ts
import { container } from '@/src/infrastructure/di/container';
import { LeagueFacade } from '@/src/application-facade/implementations/league.facade';
import { SeriesFacade } from '@/src/application-facade/implementations/series.facade';
import { setLeagueFacade } from '@/src/presentation/adapters/nextjs/controllers/league.controller';
import { setSeriesFacade } from '@/src/presentation/adapters/nextjs/controllers/series.controller';

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
setLeagueFacade(leagueFacade);
(async () => {
  await setSeriesFacade(seriesFacade);
})();

console.log('DI setup complete: Facades initialized and set in controllers');

export { container };
```

### 3. Controller Implementation

Controllers are implemented in the presentation layer and act as adapters between Next.js server actions and the application facades:

```typescript
// src/presentation/adapters/nextjs/controllers/league.controller.ts
import { ILeagueFacade } from '@/src/application-facade/interfaces/ILeagueFacade';

// This will be injected via DI container
let leagueFacade: ILeagueFacade;

// This function is used for dependency injection
export function setLeagueFacade(facade: ILeagueFacade) {
  leagueFacade = facade;
  console.log('League facade set successfully');
}

// Next.js Server Action
export async function getLeagues() {
  try {
    return await leagueFacade.getLeagues();
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return { success: false, error: 'Failed to fetch leagues' };
  }
}
```

### 4. Server Actions

Next.js server actions are defined in the `app/__actions` directory and serve as thin wrappers around the controllers:

```typescript
// app/__actions/league.ts
import {
  getLeagues as getLeaguesController,
  // other imports
} from '@/src/presentation/adapters/nextjs/controllers/league.controller';

export async function getLeagues() {
  return await getLeaguesController();
}
```

### 5. Component Integration

Components in the app directory use the server actions to interact with the application:

```tsx
// app/(root)/leagues/page.tsx
import { getLeagues } from "@/app/__actions/league";

export default async function LeaguesPage() {
  const { data, error } = await getLeagues();
  
  // Render component with data
}
```

## Data Flow

1. User interacts with a component
2. Component calls a server action
3. Server action calls a controller method
4. Controller uses a facade to access use cases
5. Use cases implement business logic using repositories
6. Repositories interact with the data source
7. Data flows back through the layers to the component

## DTO Handling

When working with DTOs (Data Transfer Objects) from the CLEAN architecture in Next.js components, it's important to understand the structure of the DTOs and how to properly access the data:

```typescript
// Example: Handling SeriesListDTO in a component
const seriesResult = await getSeries();
if (seriesResult.success) {
  // Access the series array from the SeriesListDTO
  const seriesList = seriesResult.data?.series || [];
  
  // Process the series data
  // ...
}
```

## Best Practices

1. **Keep Controllers Framework-Agnostic**: Controllers should only contain Next.js specific code and delegate all business logic to facades.

2. **Use DTOs for Data Transfer**: Always use DTOs for transferring data between layers to maintain a clean separation of concerns.

3. **Synchronous DI Setup**: Ensure that the DI setup is completed before any controllers are used to avoid "undefined" errors.

4. **Error Handling**: Implement proper error handling at each layer to provide meaningful error messages to the user.

5. **Type Safety**: Use TypeScript interfaces and types to ensure type safety across all layers.

## Common Issues and Solutions

### Issue: Controllers not initialized before use

**Solution**: Ensure the DI setup is imported in the app's entry point and that facades are set synchronously when possible.

### Issue: DTO structure mismatch

**Solution**: Always check the structure of DTOs and ensure components are accessing the correct properties.

### Issue: Server Actions with 'use server' directive

**Solution**: When using the 'use server' directive, all exported functions must be async, including setup functions.

## Conclusion

By following these guidelines, you can successfully integrate CLEAN architecture with Next.js, maintaining a clear separation of concerns while leveraging the benefits of both patterns.
