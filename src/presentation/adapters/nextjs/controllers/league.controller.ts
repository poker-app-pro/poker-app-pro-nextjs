import { ILeagueFacade } from '../../../../application-facade/interfaces/ILeagueFacade';
import { CreateLeagueDTO, UpdateLeagueDTO, LeagueSearchDTO } from '../../../../core/application/dtos/league.dto';

/**
 * Next.js League Controller
 * Handles Next.js specific server actions for league operations
 * This is the ONLY file that should contain Next.js specific code for leagues
 */

// This will be injected via DI container
let leagueFacade: ILeagueFacade;

export function setLeagueFacade(facade: ILeagueFacade) {
  leagueFacade = facade;
}

/**
 * Create a new league (Next.js Server Action)
 */
export async function createLeague(formData: FormData) {
  try {
    const data: CreateLeagueDTO = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      ownerId: formData.get('ownerId') as string,
      isActive: formData.get('isActive') === 'true',
    };

    return await leagueFacade.createLeague(data);
  } catch (error) {
    console.error('Error creating league:', error);
    return { success: false, error: 'Failed to create league' };
  }
}

/**
 * Update an existing league (Next.js Server Action)
 */
export async function updateLeague(id: string, formData: FormData) {
  try {
    const data: UpdateLeagueDTO = {
      id,
      name: formData.get('name') as string || undefined,
      description: formData.get('description') as string || undefined,
      isActive: formData.get('isActive') === 'true',
    };

    return await leagueFacade.updateLeague(data);
  } catch (error) {
    console.error('Error updating league:', error);
    return { success: false, error: 'Failed to update league' };
  }
}

/**
 * Delete a league (Next.js Server Action)
 */
export async function deleteLeague(id: string, userId: string) {
  try {
    return await leagueFacade.deleteLeague(id, userId);
  } catch (error) {
    console.error('Error deleting league:', error);
    return { success: false, error: 'Failed to delete league' };
  }
}

/**
 * Get all leagues (Next.js Server Action)
 */
export async function getLeagues() {
  try {
    return await leagueFacade.getLeagues();
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return { success: false, error: 'Failed to fetch leagues' };
  }
}

/**
 * Get a league by ID (Next.js Server Action)
 */
export async function getLeague(id: string) {
  try {
    return await leagueFacade.getLeague(id);
  } catch (error) {
    console.error('Error fetching league:', error);
    return { success: false, error: 'Failed to fetch league' };
  }
}

/**
 * Search leagues (Next.js Server Action)
 */
export async function searchLeagues(searchParams: LeagueSearchDTO) {
  try {
    return await leagueFacade.getLeagues(searchParams);
  } catch (error) {
    console.error('Error searching leagues:', error);
    return { success: false, error: 'Failed to search leagues' };
  }
}
