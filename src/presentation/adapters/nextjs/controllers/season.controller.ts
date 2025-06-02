'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  CreateSeasonDTO,
  UpdateSeasonDTO,
  SeasonSearchDTO
} from '@/src/core/application/dtos/season.dto';
import { ISeasonFacade } from '@/src/application-facade/interfaces/ISeasonFacade';

/**
 * Next.js Season Controller
 * Handles Next.js specific server actions for season operations
 * This is the ONLY file that should contain Next.js specific code for seasons
 */

// This will be injected via DI container
let seasonFacade: ISeasonFacade;

// This function is used for dependency injection and not as a server action
// It's called from the client-side code during initialization
export async function setSeasonFacade(facade: ISeasonFacade) {
  seasonFacade = facade;
  console.log('Season facade set successfully');
}

/**
 * Create a new season
 */
export async function createSeasonAction(data: CreateSeasonDTO) {
  try {
    const result = await seasonFacade.createSeason(data);

    if (result.success && result.data) {
      revalidatePath('/seasons');
      revalidatePath(`/leagues/${data.leagueId}`);
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to create season' };
  } catch (error) {
    console.error('Error creating season:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing season
 */
export async function updateSeasonAction(data: UpdateSeasonDTO) {
  try {
    const result = await seasonFacade.updateSeason(data);

    if (result.success && result.data) {
      revalidatePath('/seasons');
      revalidatePath(`/seasons/${data.id}`);
      // Get the season to get the leagueId
      const seasonResult = await seasonFacade.getSeason(data.id);
      if (seasonResult.success && seasonResult.data) {
        revalidatePath(`/leagues/${seasonResult.data.leagueId}`);
      }
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to update season' };
  } catch (error) {
    console.error('Error updating season:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a season
 */
export async function deleteSeasonAction(id: string, userId: string) {
  try {
    // Get season data before deletion for revalidation
    const seasonResult = await seasonFacade.getSeason(id);
    const result = await seasonFacade.deleteSeason(id, userId);

    if (result.success) {
      revalidatePath('/seasons');
      if (seasonResult.success && seasonResult.data) {
        revalidatePath(`/leagues/${seasonResult.data.leagueId}`);
      }
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to delete season' };
  } catch (error) {
    console.error('Error deleting season:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a season by ID
 */
export async function getSeasonAction(id: string) {
  try {
    const result = await seasonFacade.getSeason(id);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Season not found' };
  } catch (error) {
    console.error('Error getting season:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all seasons with optional search
 */
export async function getAllSeasonsAction(search?: SeasonSearchDTO) {
  try {
    const result = await seasonFacade.getAllSeasons(search);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get seasons' };
  } catch (error) {
    console.error('Error getting seasons:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get seasons by league
 */
export async function getSeasonsByLeagueAction(leagueId: string) {
  try {
    const result = await seasonFacade.getSeasonsByLeague(leagueId);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get seasons' };
  } catch (error) {
    console.error('Error getting seasons by league:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get active seasons
 */
export async function getActiveSeasonsAction(leagueId?: string) {
  try {
    const result = await seasonFacade.getActiveSeasons(leagueId);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get active seasons' };
  } catch (error) {
    console.error('Error getting active seasons:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get season with league details
 */
export async function getSeasonWithLeagueAction(id: string) {
  try {
    const result = await seasonFacade.getSeasonWithLeague(id);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get season with league details' };
  } catch (error) {
    console.error('Error getting season with league details:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Toggle season status (activate/deactivate)
 */
export async function toggleSeasonStatusAction(id: string, isActive: boolean, userId: string) {
  try {
    const result = await seasonFacade.toggleSeasonStatus(id, isActive, userId);

    if (result.success) {
      revalidatePath('/seasons');
      revalidatePath(`/seasons/${id}`);
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to toggle season status' };
  } catch (error) {
    console.error('Error toggling season status:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Navigate to season creation page
 */
export async function navigateToCreateSeasonAction(leagueId: string) {
  redirect(`/seasons/create?leagueId=${leagueId}`);
}

/**
 * Navigate to season edit page
 */
export async function navigateToEditSeasonAction(id: string) {
  redirect(`/seasons/${id}/edit`);
}

/**
 * Navigate to season detail page
 */
export async function navigateToSeasonDetailAction(id: string) {
  redirect(`/seasons/${id}`);
}
