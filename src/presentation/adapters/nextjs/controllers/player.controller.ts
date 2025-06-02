'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  CreatePlayerDto,
  UpdatePlayerDto,
  PlayerSearchDto
} from '@/src/core/application/dtos/player.dto';
import { IPlayerFacade, PlayerProfileDto } from '@/src/application-facade/interfaces/IPlayerFacade';

/**
 * Next.js Player Controller
 * Handles Next.js specific server actions for player operations
 * This is the ONLY file that should contain Next.js specific code for players
 */

// This will be injected via DI container
let playerFacade: IPlayerFacade;

// This function is used for dependency injection and not as a server action
// It's called from the client-side code during initialization
export async function setPlayerFacade(facade: IPlayerFacade) {
  playerFacade = facade;
  console.log('Player facade set successfully');
}

/**
 * Create a new player
 */
export async function createPlayerAction(data: CreatePlayerDto) {
  try {
    const result = await playerFacade.createPlayer(data);

    if (result.success && result.data) {
      revalidatePath('/players');
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to create player' };
  } catch (error) {
    console.error('Error creating player:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing player
 */
export async function updatePlayerAction(data: UpdatePlayerDto) {
  try {
    const result = await playerFacade.updatePlayer(data);

    if (result.success && result.data) {
      revalidatePath('/players');
      revalidatePath(`/players/${data.id}`);
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to update player' };
  } catch (error) {
    console.error('Error updating player:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a player
 */
export async function deletePlayerAction(id: string, userId: string) {
  try {
    const result = await playerFacade.deletePlayer(id, userId);

    if (result.success) {
      revalidatePath('/players');
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to delete player' };
  } catch (error) {
    console.error('Error deleting player:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a player by ID
 */
export async function getPlayerAction(id: string) {
  try {
    const result = await playerFacade.getPlayer(id);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Player not found' };
  } catch (error) {
    console.error('Error getting player:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all players with optional search
 */
export async function getAllPlayersAction(search?: PlayerSearchDto) {
  try {
    const result = await playerFacade.getAllPlayers(search);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get players' };
  } catch (error) {
    console.error('Error getting players:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get player profile with detailed statistics
 */
export async function getPlayerProfileAction(id: string) {
  try {
    const result = await playerFacade.getPlayerProfile(id);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get player profile' };
  } catch (error) {
    console.error('Error getting player profile:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Search players by name
 */
export async function searchPlayersAction(searchTerm: string) {
  try {
    const result = await playerFacade.searchPlayers(searchTerm);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to search players' };
  } catch (error) {
    console.error('Error searching players:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Navigate to player creation page
 */
export async function navigateToCreatePlayerAction() {
  redirect('/players/create');
}

/**
 * Navigate to player edit page
 */
export async function navigateToEditPlayerAction(id: string) {
  redirect(`/players/${id}/edit`);
}

/**
 * Navigate to player detail page
 */
export async function navigateToPlayerDetailAction(id: string) {
  redirect(`/players/${id}`);
}
