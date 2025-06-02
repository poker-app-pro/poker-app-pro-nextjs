'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  CreateLeagueDTO,
  UpdateLeagueDTO,
  LeagueSearchDTO
} from '@/src/core/application/dtos/league.dto';
import { ILeagueFacade } from '@/src/application-facade/interfaces/ILeagueFacade';

/**
 * Next.js League Controller
 * Handles Next.js specific server actions for league operations
 * This is the ONLY file that should contain Next.js specific code for leagues
 */

// This will be injected via DI container
let leagueFacade: ILeagueFacade;

// This function is used for dependency injection and not as a server action
// It's called from the client-side code during initialization
export async function setLeagueFacade(facade: ILeagueFacade) {
  leagueFacade = facade;
  console.log('League facade set successfully');
}

/**
 * Create a new league
 */
export async function createLeagueAction(data: CreateLeagueDTO) {
  try {
    const result = await leagueFacade.createLeague(data);

    if (result.success && result.data) {
      revalidatePath('/leagues');
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to create league' };
  } catch (error) {
    console.error('Error creating league:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing league
 */
export async function updateLeagueAction(data: UpdateLeagueDTO) {
  try {
    const result = await leagueFacade.updateLeague(data);

    if (result.success && result.data) {
      revalidatePath('/leagues');
      revalidatePath(`/leagues/${data.id}`);
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to update league' };
  } catch (error) {
    console.error('Error updating league:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a league
 */
export async function deleteLeagueAction(id: string, userId: string) {
  try {
    const result = await leagueFacade.deleteLeague(id, userId);

    if (result.success) {
      revalidatePath('/leagues');
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to delete league' };
  } catch (error) {
    console.error('Error deleting league:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a league by ID
 */
export async function getLeagueAction(id: string) {
  try {
    const result = await leagueFacade.getLeague(id);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'League not found' };
  } catch (error) {
    console.error('Error getting league:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all leagues with optional search
 */
export async function getAllLeaguesAction(search?: LeagueSearchDTO) {
  try {
    const result = await leagueFacade.getAllLeagues(search);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get leagues' };
  } catch (error) {
    console.error('Error getting leagues:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get leagues by user
 */
export async function getLeaguesByUserAction(userId: string) {
  try {
    const result = await leagueFacade.getLeaguesByUser(userId);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get leagues' };
  } catch (error) {
    console.error('Error getting leagues by user:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Add user to league
 */
export async function addUserToLeagueAction(leagueId: string, userId: string, role: string) {
  try {
    const result = await leagueFacade.addUserToLeague(leagueId, userId, role);

    if (result.success) {
      revalidatePath(`/leagues/${leagueId}`);
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to add user to league' };
  } catch (error) {
    console.error('Error adding user to league:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Remove user from league
 */
export async function removeUserFromLeagueAction(leagueId: string, userId: string) {
  try {
    const result = await leagueFacade.removeUserFromLeague(leagueId, userId);

    if (result.success) {
      revalidatePath(`/leagues/${leagueId}`);
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to remove user from league' };
  } catch (error) {
    console.error('Error removing user from league:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get league users
 */
export async function getLeagueUsersAction(leagueId: string) {
  try {
    const result = await leagueFacade.getLeagueUsers(leagueId);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get league users' };
  } catch (error) {
    console.error('Error getting league users:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Navigate to league creation page
 */
export async function navigateToCreateLeagueAction() {
  redirect('/leagues/create');
}

/**
 * Navigate to league edit page
 */
export async function navigateToEditLeagueAction(id: string) {
  redirect(`/leagues/${id}/edit`);
}

/**
 * Navigate to league detail page
 */
export async function navigateToLeagueDetailAction(id: string) {
  redirect(`/leagues/${id}`);
}
