'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  IResultsFacade,
  SaveGameResultsDto,
  UpdateTournamentResultDto
} from '@/src/application-facade/interfaces/IResultsFacade';
import { GameType } from '@/src/core/domain/entities/game-result.entity';
import { getCurrentUser } from 'aws-amplify/auth/server';
import { cookies } from 'next/headers';
import { runWithAmplifyServerContext } from '@/lib/amplify-utils';

/**
 * Next.js Results Controller
 * Handles Next.js specific server actions for tournament results operations
 * This is the ONLY file that should contain Next.js specific code for results
 */

// This will be injected via DI container
let resultsFacade: IResultsFacade;

// This function is used for dependency injection and not as a server action
// It's called from the client-side code during initialization
export async function setResultsFacade(facade: IResultsFacade) {
  resultsFacade = facade;
  console.log('Results facade set successfully');
}

/**
 * Save game results
 */
export async function saveGameResultsAction(formData: FormData) {
  try {
    // Get current user
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    const userId = currentUser.userId;

    // Extract form data
    const seriesId = formData.get('seriesId') as string;
    const totalPlayers = Number.parseInt(formData.get('totalPlayers') as string, 10);
    const gameTime = new Date(formData.get('gameTime') as string);
    const gameType = (formData.get('gameType') as string) || GameType.Tournament;

    // Parse player data
    const rankingsJson = formData.get('rankings') as string;
    const bountiesJson = formData.get('bounties') as string;
    const consolationJson = formData.get('consolation') as string;
    const temporaryPlayersJson = formData.get('temporaryPlayers') as string || '[]';
    
    const rankings = JSON.parse(rankingsJson);
    const bounties = JSON.parse(bountiesJson);
    const consolation = JSON.parse(consolationJson);
    const temporaryPlayers = JSON.parse(temporaryPlayersJson);

    // Validate total players is at least equal to the number of ranked players
    if (totalPlayers < rankings.length) {
      return {
        success: false,
        error: `Total players (${totalPlayers}) cannot be less than the number of ranked players (${rankings.length})`,
      };
    }

    // Convert to DTO
    const data: SaveGameResultsDto = {
      seriesId,
      totalPlayers,
      gameTime: gameTime.toISOString(),
      gameType: gameType as GameType,
      rankings,
      bounties,
      consolation,
      temporaryPlayers,
      userId
    };

    const result = await resultsFacade.saveGameResults(data);

    if (result.success) {
      revalidatePath('/results');
      revalidatePath('/standings');
      revalidatePath('/players');
      revalidatePath('/qualification');
      return { success: true, data: result.data, message: result.message };
    }

    return { success: false, error: result.error || 'Failed to save game results' };
  } catch (error) {
    console.error('Error saving game results:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all tournament results
 */
export async function getTournamentResultsAction() {
  try {
    const result = await resultsFacade.getTournamentResults();

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get tournament results' };
  } catch (error) {
    console.error('Error getting tournament results:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get tournament result details
 */
export async function getTournamentResultDetailsAction(id: string) {
  try {
    const result = await resultsFacade.getTournamentResultDetails(id);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get tournament result details' };
  } catch (error) {
    console.error('Error getting tournament result details:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update tournament result
 */
export async function updateTournamentResultAction(id: string, formData: FormData) {
  try {
    // Extract form data
    const name = formData.get('name') as string;
    const gameTime = formData.get('gameTime') as string;
    const location = formData.get('location') as string;
    const buyIn = Number.parseFloat(formData.get('buyIn') as string) || 0;
 
    // Validate required fields
    if (!name.trim()) {
      return { success: false, error: 'Tournament name is required' };
    }

    if (!gameTime) {
      return { success: false, error: 'Game date and time is required' };
    }

    // Convert to DTO
    const data: UpdateTournamentResultDto = {
      id,
      name,
      gameTime: new Date(gameTime).toISOString(),
      location,
      buyIn
    };

    const result = await resultsFacade.updateTournamentResult(data);

    if (result.success) {
      revalidatePath('/results');
      revalidatePath(`/results/${id}`);
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to update tournament result' };
  } catch (error) {
    console.error('Error updating tournament result:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete tournament result
 */
export async function deleteTournamentResultAction(id: string) {
  try {
    // Get current user
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    const userId = currentUser.userId;

    const result = await resultsFacade.deleteTournamentResult(id, userId);

    if (result.success) {
      revalidatePath('/results');
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to delete tournament result' };
  } catch (error) {
    console.error('Error deleting tournament result:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Navigate to results page
 */
export async function navigateToResultsAction() {
  redirect('/results');
}

/**
 * Navigate to create result page
 */
export async function navigateToCreateResultAction() {
  redirect('/results/create');
}

/**
 * Navigate to result detail page
 */
export async function navigateToResultDetailAction(id: string) {
  redirect(`/results/${id}`);
}
