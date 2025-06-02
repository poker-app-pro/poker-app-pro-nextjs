'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  IQualificationFacade,
  QualifiedPlayerDto,
  QualificationStatusDto,
  SeasonEventDto,
  RecordSeasonEventDto
} from '@/src/application-facade/interfaces/IQualificationFacade';

/**
 * Next.js Qualification Controller
 * Handles Next.js specific server actions for qualification operations
 * This is the ONLY file that should contain Next.js specific code for qualifications
 */

// This will be injected via DI container
let qualificationFacade: IQualificationFacade;

// This function is used for dependency injection and not as a server action
// It's called from the client-side code during initialization
export async function setQualificationFacade(facade: IQualificationFacade) {
  qualificationFacade = facade;
  console.log('Qualification facade set successfully');
}

/**
 * Get qualified players for a season
 */
export async function getQualifiedPlayersAction(seasonId: string, searchQuery?: string) {
  try {
    const result = await qualificationFacade.getQualifiedPlayers(seasonId, searchQuery);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get qualified players' };
  } catch (error) {
    console.error('Error getting qualified players:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get qualification status for a season
 */
export async function getQualificationStatusAction(seasonId: string) {
  try {
    const result = await qualificationFacade.getQualificationStatus(seasonId);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get qualification status' };
  } catch (error) {
    console.error('Error getting qualification status:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get previous season events
 */
export async function getPreviousSeasonEventsAction(seasonId: string) {
  try {
    const result = await qualificationFacade.getPreviousSeasonEvents(seasonId);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get previous season events' };
  } catch (error) {
    console.error('Error getting previous season events:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Record season event results
 */
export async function recordSeasonEventAction(data: RecordSeasonEventDto) {
  try {
    const result = await qualificationFacade.recordSeasonEvent(data);

    if (result.success) {
      revalidatePath('/qualification');
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to record season event' };
  } catch (error) {
    console.error('Error recording season event:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Record season event results from form data
 */
export async function recordSeasonEventFromFormAction(formData: FormData) {
  try {
    const seasonId = formData.get('seasonId') as string;
    const eventName = formData.get('eventName') as string;
    const eventDate = formData.get('eventDate') as string;
    const resultsJson = formData.get('results') as string;
    const results = JSON.parse(resultsJson);
    const userId = formData.get('userId') as string;

    const data: RecordSeasonEventDto = {
      seasonId,
      eventName,
      eventDate,
      results,
      userId
    };

    return await recordSeasonEventAction(data);
  } catch (error) {
    console.error('Error processing form data:', error);
    return { success: false, error: 'Failed to process form data' };
  }
}

/**
 * Navigate to qualification page
 */
export async function navigateToQualificationAction() {
  redirect('/qualification');
}

/**
 * Navigate to qualification history page
 */
export async function navigateToQualificationHistoryAction() {
  redirect('/qualification/history');
}

/**
 * Navigate to record qualification page
 */
export async function navigateToRecordQualificationAction() {
  redirect('/qualification/record');
}
