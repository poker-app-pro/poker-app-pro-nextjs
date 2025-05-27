# Migration Guide: From Legacy to Clean Architecture

This guide provides step-by-step instructions for migrating the existing Poker App Pro codebase to the new Clean Architecture implementation.

## Overview

The migration involves replacing the existing server actions and components with the new clean architecture implementation. This guide shows how to update each part of the application systematically.

## Step 1: Update Server Actions

### Before (Legacy)
```typescript
// app/__actions/league.ts
"use server"
import { cookieBasedClient } from "@/lib/amplify-utils"
import { revalidatePath } from "next/cache"

export async function createLeague(formData: FormData) {
  // Direct Amplify client usage
  const result = await cookieBasedClient.models.League.create(...)
  // Business logic mixed with infrastructure
}
```

### After (Clean Architecture)
```typescript
// Replace imports in existing files
- import { createLeague } from "@/app/__actions/league"
+ import { createLeague } from "@/src/adapters/nextjs/actions/league.actions"
```

## Step 2: Update Components

### Before (Legacy)
```typescript
// app/(root)/leagues/_components/leagues-list.tsx
import { getLeagues } from "@/app/__actions/league"
```

### After (Clean Architecture)
```typescript
// Replace component imports
- import LeaguesList from "./_components/leagues-list"
+ import LeaguesList from "@/src/adapters/nextjs/components/leagues-list.component"
```

## Step 3: File-by-File Migration

### 1. Update League Actions Usage

**Files to update:**
- `app/(root)/leagues/create/page.tsx`
- `app/(root)/leagues/[id]/edit/page.tsx`
- Any other files importing from `app/__actions/league.ts`

**Changes:**
```typescript
// Old import
import { createLeague, updateLeague, deleteLeague } from "@/app/__actions/league"

// New import
import { createLeague, updateLeague, deleteLeague } from "@/src/adapters/nextjs/actions/league.actions"
```

### 2. Update Component Imports

**Files to update:**
- `app/(root)/leagues/page.tsx` ✅ (Already updated)
- Any other files importing the leagues list component

### 3. Update Other Entity Actions (Future)

When migrating other entities, follow the same pattern:

```typescript
// Players
- import { createPlayer } from "@/app/__actions/players"
+ import { createPlayer } from "@/src/adapters/nextjs/actions/player.actions"

// Tournaments
- import { createTournament } from "@/app/__actions/results"
+ import { createTournament } from "@/src/adapters/nextjs/actions/tournament.actions"
```

## Step 4: Remove Legacy Files (After Migration)

Once all imports are updated, remove the legacy files:

1. `app/__actions/league.ts`
2. `app/(root)/leagues/_components/leagues-list.tsx`
3. Other legacy action files as they're migrated

## Step 5: Testing the Migration

### 1. Verify League Functionality
- [ ] Create new league works
- [ ] List leagues displays correctly
- [ ] Update league works
- [ ] Delete league works

### 2. Check for Import Errors
```bash
npm run build
```

### 3. Runtime Testing
```bash
npm run dev
```

Navigate to `/leagues` and test all functionality.

## Common Issues and Solutions

### Issue 1: Import Path Errors
**Problem:** TypeScript errors about missing modules
**Solution:** Ensure the new files are created and paths are correct

### Issue 2: Amplify Client Not Initialized
**Problem:** "Container not initialized" error
**Solution:** Ensure `ensureAmplifyInitialized()` is called in server actions

### Issue 3: Type Mismatches
**Problem:** TypeScript errors about incompatible types
**Solution:** Update type imports to use domain entities:
```typescript
- interface League { ... }
+ import { LeagueEntity } from "@/src/core/domain/entities/league.entity"
```

## Benefits After Migration

### 1. Improved Testability
```typescript
// Can now easily test business logic
const mockRepository = new MockLeagueRepository();
const useCase = new CreateLeagueUseCaseImpl(mockRepository, ...);
const result = await useCase.execute(request);
```

### 2. Framework Independence
```typescript
// Business logic is now framework-agnostic
// Can easily switch from Next.js to Express, Fastify, etc.
```

### 3. Better Error Handling
```typescript
// Consistent error handling across all use cases
if (!result.success) {
  return { success: false, error: result.error };
}
```

### 4. Domain Events
```typescript
// Automatic activity logging and event publishing
// No need to manually log activities in each action
```

## Next Steps

### 1. Complete Entity Migration
- [ ] Player entity and use cases
- [ ] Tournament entity and use cases
- [ ] Season entity and use cases
- [ ] Series entity and use cases

### 2. Add Comprehensive Testing
- [ ] Unit tests for use cases
- [ ] Integration tests for repositories
- [ ] End-to-end tests for user flows

### 3. Performance Optimization
- [ ] Add caching to repositories
- [ ] Implement query optimization
- [ ] Add monitoring and metrics

### 4. Security Enhancements
- [ ] Add authorization to use cases
- [ ] Implement input sanitization
- [ ] Add audit logging

## Example: Complete League Create Form Migration

### Before
```typescript
// app/(root)/leagues/create/page.tsx
import { createLeague } from "@/app/__actions/league"

export default function CreateLeaguePage() {
  async function handleSubmit(formData: FormData) {
    const result = await createLeague(formData);
    // Handle result
  }
  
  return (
    <form action={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### After
```typescript
// app/(root)/leagues/create/page.tsx
import { createLeague } from "@/src/adapters/nextjs/actions/league.actions"

export default function CreateLeaguePage() {
  async function handleSubmit(formData: FormData) {
    const result = await createLeague(formData);
    // Handle result - same interface, cleaner implementation
  }
  
  return (
    <form action={handleSubmit}>
      {/* Form fields - no changes needed */}
    </form>
  );
}
```

The interface remains the same, but the underlying implementation is now clean, testable, and framework-independent.
