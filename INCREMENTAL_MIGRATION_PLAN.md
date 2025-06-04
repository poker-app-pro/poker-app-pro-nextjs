# Incremental Migration Plan to CLEAN Architecture

## 1. Current Status Analysis

### What's Currently Broken

Based on the analysis of the codebase, the following issues have been identified:

1. **Inconsistent Architecture**: Some parts of the application are using the CLEAN architecture pattern (server actions in `app/__actions/`), while others are still using direct API calls to Amplify (UI components like `app/(root)/leagues/create/page.tsx`).

2. **Incomplete DI Setup**: The Dependency Injection container is set up, but not all facades have been implemented and injected into controllers.

3. **Missing Facade Implementations**: Only `LeagueFacade` and `PlayerFacade` have been implemented, while other facades are still missing.

4. **Direct Amplify Usage in UI Components**: Many UI components are directly using Amplify client instead of going through the CLEAN architecture layers.

### Current Integration Approach

The current approach is to:

1. Define facade interfaces in `src/application-facade/interfaces/`
2. Implement facades in `src/application-facade/implementations/`
3. Create controllers in `src/presentation/adapters/nextjs/controllers/`
4. Update server actions in `app/__actions/` to use the controllers
5. Set up a DI container to wire everything together

This approach maintains the Next.js App Router structure while leveraging the CLEAN architecture in the `src/` directory.

## 2. Incremental Migration Strategy

To ensure the application remains functional during the migration, we'll follow an incremental approach:

### Phase 1: Complete the Foundation

1. **Complete Missing Facade Interfaces**:
   - Create interfaces for all remaining facades (Qualification, Results, Seasons, Series, Standings)
   - Ensure all necessary methods are defined

2. **Complete Missing Facade Implementations**:
   - Implement all facade interfaces
   - Ensure they use the appropriate repositories and services

3. **Update DI Container**:
   - Register all facades in the DI container
   - Ensure proper initialization in `app/di-setup.ts`

### Phase 2: Migrate UI Components One Feature at a Time

Starting with one feature (e.g., Leagues), migrate all related UI components to use the CLEAN architecture:

1. **Update Create Page**:
   - Modify `app/(root)/leagues/create/page.tsx` to use the `createLeague` server action
   - Remove direct Amplify client usage

2. **Update Edit Page**:
   - Modify `app/(root)/leagues/[id]/edit/page.tsx` to use the `updateLeague` server action
   - Remove direct Amplify client usage

3. **Update Detail Page**:
   - Modify `app/(root)/leagues/[id]/page.tsx` to use the `getLeague` server action
   - Remove direct Amplify client usage

4. **Update List Page**:
   - Ensure `app/(root)/leagues/page.tsx` and its components use the `getLeagues` server action
   - Remove direct Amplify client usage

5. **Repeat for Other Features**:
   - Apply the same pattern to Players, Qualification, Results, Seasons, Series, and Standings

### Phase 3: Migrate API Routes

1. **Update API Routes**:
   - Modify API routes to use controllers instead of direct Amplify client usage
   - Ensure proper error handling and response formatting

### Phase 4: Testing and Validation

1. **Create Unit Tests**:
   - Write unit tests for facades and controllers
   - Ensure all business logic is properly tested

2. **Create Integration Tests**:
   - Test the integration between UI components, server actions, and facades
   - Ensure data flows correctly through all layers

3. **Manual Testing**:
   - Test all features manually to ensure they work as expected
   - Fix any issues that arise

## 3. Step-by-Step Migration Plan

### Step 1: Complete Facade Interfaces and Implementations

#### 1.1 Create Missing Facade Interfaces

```typescript
// src/application-facade/interfaces/IQualificationFacade.ts
import { 
  CreateQualificationDTO, 
  UpdateQualificationDTO, 
  QualificationDTO, 
  QualificationListDTO, 
  QualificationSearchDTO 
} from '@/src/core/application/dtos/qualification.dto';

export interface IQualificationFacade {
  createQualification(data: CreateQualificationDTO): Promise<{ success: boolean; data?: QualificationDTO; error?: string }>;
  updateQualification(data: UpdateQualificationDTO): Promise<{ success: boolean; data?: QualificationDTO; error?: string }>;
  deleteQualification(id: string, userId: string): Promise<{ success: boolean; error?: string }>;
  getQualification(id: string): Promise<{ success: boolean; data?: QualificationDTO; error?: string }>;
  getAllQualifications(search?: QualificationSearchDTO): Promise<{ success: boolean; data?: QualificationListDTO; error?: string }>;
  // Add other methods as needed
}
```

Repeat for other missing facade interfaces (Results, Seasons, Series, Standings).

#### 1.2 Implement Missing Facades

```typescript
// src/application-facade/implementations/QualificationFacade.ts
import { IQualificationFacade } from '../interfaces/IQualificationFacade';
import { 
  CreateQualificationDTO, 
  UpdateQualificationDTO, 
  QualificationDTO, 
  QualificationListDTO, 
  QualificationSearchDTO 
} from '@/src/core/application/dtos/qualification.dto';
import { cookieBasedClient } from '@/lib/amplify-utils';

export class QualificationFacade implements IQualificationFacade {
  // Implement interface methods
  async createQualification(data: CreateQualificationDTO): Promise<{ success: boolean; data?: QualificationDTO; error?: string }> {
    try {
      // Implementation
      const result = await cookieBasedClient.models.Qualification.create(
        {
          // Map DTO to model
        },
        {
          authMode: 'userPool',
        }
      );

      if (!result.data) {
        return { success: false, error: 'Failed to create qualification' };
      }

      return {
        success: true,
        data: {
          // Map model to DTO
        },
      };
    } catch (error) {
      console.error('Error creating qualification:', error);
      return { success: false, error: 'Failed to create qualification' };
    }
  }

  // Implement other methods
}
```

Repeat for other missing facade implementations.

#### 1.3 Update DI Container

```typescript
// src/infrastructure/di/container.ts
import { IQualificationFacade } from '@/src/application-facade/interfaces/IQualificationFacade';
import { IResultsFacade } from '@/src/application-facade/interfaces/IResultsFacade';
import { ISeasonFacade } from '@/src/application-facade/interfaces/ISeasonFacade';
import { ISeriesFacade } from '@/src/application-facade/interfaces/ISeriesFacade';
import { IStandingsFacade } from '@/src/application-facade/interfaces/IStandingsFacade';

import { QualificationFacade } from '@/src/application-facade/implementations/QualificationFacade';
import { ResultsFacade } from '@/src/application-facade/implementations/ResultsFacade';
import { SeasonFacade } from '@/src/application-facade/implementations/SeasonFacade';
import { SeriesFacade } from '@/src/application-facade/implementations/SeriesFacade';
import { StandingsFacade } from '@/src/application-facade/implementations/StandingsFacade';

import { setQualificationFacade } from '@/src/presentation/adapters/nextjs/controllers/qualification.controller';
import { setResultsFacade } from '@/src/presentation/adapters/nextjs/controllers/results.controller';
import { setSeasonFacade } from '@/src/presentation/adapters/nextjs/controllers/season.controller';
import { setSeriesFacade } from '@/src/presentation/adapters/nextjs/controllers/series.controller';
import { setStandingsFacade } from '@/src/presentation/adapters/nextjs/controllers/standings.controller';

class DIContainer {
  // Existing code...

  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('DI container already initialized');
      return;
    }

    console.log('Initializing DI container...');

    try {
      // Create facade instances
      const leagueFacade: ILeagueFacade = new LeagueFacade();
      const playerFacade: IPlayerFacade = new PlayerFacade();
      const qualificationFacade: IQualificationFacade = new QualificationFacade();
      const resultsFacade: IResultsFacade = new ResultsFacade();
      const seasonFacade: ISeasonFacade = new SeasonFacade();
      const seriesFacade: ISeriesFacade = new SeriesFacade();
      const standingsFacade: IStandingsFacade = new StandingsFacade();

      // Inject facades into controllers
      await setLeagueFacade(leagueFacade);
      await setPlayerFacade(playerFacade);
      await setQualificationFacade(qualificationFacade);
      await setResultsFacade(resultsFacade);
      await setSeasonFacade(seasonFacade);
      await setSeriesFacade(seriesFacade);
      await setStandingsFacade(standingsFacade);

      this.initialized = true;
      console.log('DI container initialized successfully');
    } catch (error) {
      console.error('Error initializing DI container:', error);
      throw error;
    }
  }
}
```

### Step 2: Migrate UI Components (Leagues Example)

#### 2.1 Update Create League Page

```typescript
// app/(root)/leagues/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Trophy, Loader2, AlertCircle, ImageIcon } from "lucide-react";
import { getCurrentUser } from "aws-amplify/auth";
import { FormSubmissionState } from "@/components/ui/form-submission-state";
import { createLeague } from "@/app/__actions/league";

type FormState = "idle" | "submitting" | "success" | "error";

export default function CreateLeaguePage() {
  const router = useRouter();
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Validation errors
  const [nameError, setNameError] = useState("");

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setNameError("");

    // Validate name
    if (!name.trim()) {
      setNameError("League name is required");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    const user = await getCurrentUser();
    setState("submitting");
    setError("");

    try {
      // Create form data
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("ownerId", user.userId);
      if (isActive) {
        formData.append("isActive", "on");
      }

      // Call server action
      const result = await createLeague(formData);

      if (result.success) {
        setState("success");
        router.push("/leagues");
      } else {
        setState("error");
        setError(result.error || "An error occurred while creating the league");
      }
    } catch (err) {
      console.log(err);
      setState("error");
      setError(
        "An error occurred while creating the league. Please try again."
      );
    }
  };

  // Rest of the component remains the same
}
```

#### 2.2 Update Leagues List Component

```typescript
// app/(root)/leagues/_components/leagues-list.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Plus, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getLeagues } from "@/app/__actions/league";

// Rest of the component remains the same, but replace the Amplify client usage with server actions
```

### Step 3: Migrate API Routes

```typescript
// app/api/players/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchPlayers } from '@/src/presentation/adapters/nextjs/controllers/player.controller';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchTerm = searchParams.get('search') || '';
  
  const result = await searchPlayers({ searchTerm });
  
  return NextResponse.json(result);
}
```

## 4. Testing Strategy

### Unit Tests

```typescript
// src/application-facade/implementations/__tests__/LeagueFacade.test.ts
import { LeagueFacade } from '../LeagueFacade';
import { cookieBasedClient } from '@/lib/amplify-utils';

// Mock the Amplify client
jest.mock('@/lib/amplify-utils', () => ({
  cookieBasedClient: {
    models: {
      League: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        get: jest.fn(),
        list: jest.fn(),
      },
      LeagueUser: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        list: jest.fn(),
      },
      ActivityLog: {
        create: jest.fn(),
      },
    },
  },
}));

describe('LeagueFacade', () => {
  let leagueFacade: LeagueFacade;

  beforeEach(() => {
    leagueFacade = new LeagueFacade();
    jest.clearAllMocks();
  });

  describe('createLeague', () => {
    it('should create a league successfully', async () => {
      // Mock implementation
      (cookieBasedClient.models.League.create as jest.Mock).mockResolvedValue({
        data: {
          id: '123',
          name: 'Test League',
          description: 'Test Description',
          userId: 'user123',
          isActive: true,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      });

      // Call the method
      const result = await leagueFacade.createLeague({
        name: 'Test League',
        description: 'Test Description',
        ownerId: 'user123',
        isActive: true,
      });

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: '123',
        name: 'Test League',
        description: 'Test Description',
        ownerId: 'user123',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      });
      expect(cookieBasedClient.models.League.create).toHaveBeenCalledWith(
        {
          name: 'Test League',
          description: 'Test Description',
          userId: 'user123',
          isActive: true,
        },
        {
          authMode: 'userPool',
        }
      );
    });

    // Add more test cases
  });

  // Test other methods
});
```

### Integration Tests

```typescript
// src/presentation/adapters/nextjs/controllers/__tests__/league.controller.test.ts
import { createLeagueAction, getLeagueAction } from '../league.controller';
import { setLeagueFacade } from '../league.controller';
import { LeagueFacade } from '@/src/application-facade/implementations/LeagueFacade';

// Mock the LeagueFacade
jest.mock('@/src/application-facade/implementations/LeagueFacade');

describe('League Controller', () => {
  let mockLeagueFacade: jest.Mocked<LeagueFacade>;

  beforeEach(() => {
    mockLeagueFacade = new LeagueFacade() as jest.Mocked<LeagueFacade>;
    setLeagueFacade(mockLeagueFacade);
  });

  describe('createLeagueAction', () => {
    it('should create a league successfully', async () => {
      // Mock implementation
      mockLeagueFacade.createLeague.mockResolvedValue({
        success: true,
        data: {
          id: '123',
          name: 'Test League',
          description: 'Test Description',
          ownerId: 'user123',
          isActive: true,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      });

      // Call the method
      const result = await createLeagueAction({
        name: 'Test League',
        description: 'Test Description',
        ownerId: 'user123',
        isActive: true,
      });

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: '123',
        name: 'Test League',
        description: 'Test Description',
        ownerId: 'user123',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      });
      expect(mockLeagueFacade.createLeague).toHaveBeenCalledWith({
        name: 'Test League',
        description: 'Test Description',
        ownerId: 'user123',
        isActive: true,
      });
    });

    // Add more test cases
  });

  // Test other methods
});
```

## 5. Timeline and Prioritization

### Week 1: Foundation

- Day 1-2: Complete missing facade interfaces
- Day 3-4: Implement missing facades
- Day 5: Update DI container and setup

### Week 2: Leagues Feature

- Day 1-2: Migrate Leagues UI components
- Day 3: Write tests for Leagues feature
- Day 4-5: Fix any issues and ensure everything works

### Week 3: Players Feature

- Day 1-2: Migrate Players UI components
- Day 3: Write tests for Players feature
- Day 4-5: Fix any issues and ensure everything works

### Week 4: Other Features

- Day 1-2: Migrate Qualification UI components
- Day 3-4: Migrate Results UI components
- Day 5: Write tests for these features

### Week 5: Remaining Features

- Day 1-2: Migrate Seasons UI components
- Day 3-4: Migrate Series and Standings UI components
- Day 5: Write tests for these features

### Week 6: API Routes and Final Testing

- Day 1-2: Migrate API routes
- Day 3-4: Comprehensive testing
- Day 5: Documentation and knowledge transfer

## 6. Conclusion

This incremental migration plan allows for a gradual transition to the CLEAN architecture while keeping the application functional throughout the process. By focusing on one feature at a time, we can ensure that each part of the application is properly migrated and tested before moving on to the next.

The key benefits of this approach are:

1. **Reduced Risk**: By migrating one feature at a time, we reduce the risk of breaking the entire application.
2. **Continuous Functionality**: The application remains functional throughout the migration process.
3. **Incremental Testing**: We can test each feature as it's migrated, making it easier to identify and fix issues.
4. **Flexibility**: We can adjust the plan as needed based on the results of each phase.

By following this plan, we can successfully migrate the application to the CLEAN architecture while minimizing disruption to users and developers.
