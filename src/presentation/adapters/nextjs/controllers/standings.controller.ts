'use server';

import { IStandingsFacade } from '@/src/application-facade/interfaces/IStandingsFacade';

/**
 * Next.js Standings Controller
 * Handles Next.js specific server actions for standings operations
 * This is the ONLY file that should contain Next.js specific code for standings
 */

// This will be injected via DI container
let standingsFacade: IStandingsFacade;

// This function is used for dependency injection and not as a server action
// It's called from the client-side code during initialization
export async function setStandingsFacade(facade: IStandingsFacade) {
  standingsFacade = facade;
  console.log('Standings facade set successfully');
}

/**
 * Get standings for all active seasons
 */
export async function getStandingsAction() {
  try {
    const result = await standingsFacade.getStandings();

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get standings' };
  } catch (error) {
    console.error('Error getting standings:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get detailed standings for a specific series
 */
export async function getSeriesStandingsAction(seriesId: string) {
  try {
    const result = await standingsFacade.getSeriesStandings(seriesId);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get series standings' };
  } catch (error) {
    console.error('Error getting series standings:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
