'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  CreateTournamentDTO,
  UpdateTournamentDTO,
  TournamentSearchDTO,
  TournamentResultDTO
} from '@/src/core/application/dtos/tournament.dto';
import { ITournamentFacade } from '@/src/application-facade/interfaces/ITournamentFacade';

/**
 * Next.js Tournament Controller
 * Handles Next.js specific server actions for tournament operations
 * This is the ONLY file that should contain Next.js specific code for tournaments
 */

// This will be injected via DI container
let tournamentFacade: ITournamentFacade;

// This function is used for dependency injection and not as a server action
// It's called from the client-side code during initialization
export async function setTournamentFacade(facade: ITournamentFacade) {
  tournamentFacade = facade;
  console.log('Tournament facade set successfully');
}

/**
 * Create a new tournament
 */
export async function createTournamentAction(data: CreateTournamentDTO) {
  try {
    const result = await tournamentFacade.createTournament(data);

    if (result.success && result.data) {
      revalidatePath('/tournaments');
      if (data.seriesId) {
        revalidatePath(`/series/${data.seriesId}`);
      }
      // Get the seasonId from the result data
      if (result.data.seasonId) {
        revalidatePath(`/seasons/${result.data.seasonId}`);
      }
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to create tournament' };
  } catch (error) {
    console.error('Error creating tournament:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing tournament
 */
export async function updateTournamentAction(data: UpdateTournamentDTO) {
  try {
    const result = await tournamentFacade.updateTournament(data);

    if (result.success && result.data) {
      revalidatePath('/tournaments');
      revalidatePath(`/tournaments/${data.id}`);
      if (result.data.seriesId) {
        revalidatePath(`/series/${result.data.seriesId}`);
      }
      if (result.data.seasonId) {
        revalidatePath(`/seasons/${result.data.seasonId}`);
      }
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to update tournament' };
  } catch (error) {
    console.error('Error updating tournament:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a tournament
 */
export async function deleteTournamentAction(id: string, userId: string) {
  try {
    // Get tournament data before deletion for revalidation
    const tournamentResult = await tournamentFacade.getTournament(id);
    const result = await tournamentFacade.deleteTournament(id, userId);

    if (result.success) {
      revalidatePath('/tournaments');
      if (tournamentResult.success && tournamentResult.data) {
        if (tournamentResult.data.seriesId) {
          revalidatePath(`/series/${tournamentResult.data.seriesId}`);
        }
        if (tournamentResult.data.seasonId) {
          revalidatePath(`/seasons/${tournamentResult.data.seasonId}`);
        }
      }
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to delete tournament' };
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a tournament by ID
 */
export async function getTournamentAction(id: string) {
  try {
    const result = await tournamentFacade.getTournament(id);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Tournament not found' };
  } catch (error) {
    console.error('Error getting tournament:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all tournaments with optional search
 */
export async function getAllTournamentsAction(search?: TournamentSearchDTO) {
  try {
    const result = await tournamentFacade.getAllTournaments(search);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get tournaments' };
  } catch (error) {
    console.error('Error getting tournaments:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get tournaments by series
 */
export async function getTournamentsBySeriesAction(seriesId: string) {
  try {
    const result = await tournamentFacade.getTournamentsBySeries(seriesId);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get tournaments' };
  } catch (error) {
    console.error('Error getting tournaments by series:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get tournaments by season
 */
export async function getTournamentsBySeasonAction(seasonId: string) {
  try {
    const result = await tournamentFacade.getTournamentsBySeason(seasonId);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get tournaments' };
  } catch (error) {
    console.error('Error getting tournaments by season:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get tournaments by league
 */
export async function getTournamentsByLeagueAction(leagueId: string) {
  try {
    const result = await tournamentFacade.getTournamentsByLeague(leagueId);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get tournaments' };
  } catch (error) {
    console.error('Error getting tournaments by league:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get tournaments by status
 */
export async function getTournamentsByStatusAction(status: 'scheduled' | 'registration' | 'active' | 'completed' | 'cancelled') {
  try {
    const result = await tournamentFacade.getTournamentsByStatus(status);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get tournaments' };
  } catch (error) {
    console.error('Error getting tournaments by status:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get tournament summary
 */
export async function getTournamentSummaryAction(id: string) {
  try {
    const result = await tournamentFacade.getTournamentSummary(id);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get tournament summary' };
  } catch (error) {
    console.error('Error getting tournament summary:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get tournament statistics
 */
export async function getTournamentStatsAction(id: string) {
  try {
    const result = await tournamentFacade.getTournamentStats(id);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get tournament statistics' };
  } catch (error) {
    console.error('Error getting tournament statistics:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Register player for tournament
 */
export async function registerPlayerAction(tournamentId: string, playerId: string, userId: string) {
  try {
    const result = await tournamentFacade.registerPlayer(tournamentId, playerId, userId);

    if (result.success) {
      revalidatePath(`/tournaments/${tournamentId}`);
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to register player' };
  } catch (error) {
    console.error('Error registering player:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Unregister player from tournament
 */
export async function unregisterPlayerAction(tournamentId: string, playerId: string, userId: string) {
  try {
    const result = await tournamentFacade.unregisterPlayer(tournamentId, playerId, userId);

    if (result.success) {
      revalidatePath(`/tournaments/${tournamentId}`);
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to unregister player' };
  } catch (error) {
    console.error('Error unregistering player:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get tournament registrations
 */
export async function getTournamentRegistrationsAction(tournamentId: string) {
  try {
    const result = await tournamentFacade.getTournamentRegistrations(tournamentId);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get tournament registrations' };
  } catch (error) {
    console.error('Error getting tournament registrations:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Start tournament
 */
export async function startTournamentAction(id: string, userId: string) {
  try {
    const result = await tournamentFacade.startTournament(id, userId);

    if (result.success) {
      revalidatePath(`/tournaments/${id}`);
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to start tournament' };
  } catch (error) {
    console.error('Error starting tournament:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Complete tournament
 */
export async function completeTournamentAction(id: string, results: TournamentResultDTO[], userId: string) {
  try {
    const result = await tournamentFacade.completeTournament(id, results, userId);

    if (result.success) {
      revalidatePath(`/tournaments/${id}`);
      revalidatePath('/tournaments');
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to complete tournament' };
  } catch (error) {
    console.error('Error completing tournament:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Cancel tournament
 */
export async function cancelTournamentAction(id: string, reason: string, userId: string) {
  try {
    const result = await tournamentFacade.cancelTournament(id, reason, userId);

    if (result.success) {
      revalidatePath(`/tournaments/${id}`);
      revalidatePath('/tournaments');
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to cancel tournament' };
  } catch (error) {
    console.error('Error cancelling tournament:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get tournament results
 */
export async function getTournamentResultsAction(tournamentId: string) {
  try {
    const result = await tournamentFacade.getTournamentResults(tournamentId);

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
 * Update tournament status
 */
export async function updateTournamentStatusAction(id: string, status: 'scheduled' | 'registration' | 'active' | 'completed' | 'cancelled', userId: string) {
  try {
    const result = await tournamentFacade.updateTournamentStatus(id, status, userId);

    if (result.success) {
      revalidatePath(`/tournaments/${id}`);
      revalidatePath('/tournaments');
      return { success: true };
    }

    return { success: false, error: result.error || 'Failed to update tournament status' };
  } catch (error) {
    console.error('Error updating tournament status:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get upcoming tournaments
 */
export async function getUpcomingTournamentsAction(days?: number) {
  try {
    const result = await tournamentFacade.getUpcomingTournaments(days);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get upcoming tournaments' };
  } catch (error) {
    console.error('Error getting upcoming tournaments:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get recent tournaments
 */
export async function getRecentTournamentsAction(days?: number) {
  try {
    const result = await tournamentFacade.getRecentTournaments(days);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error || 'Failed to get recent tournaments' };
  } catch (error) {
    console.error('Error getting recent tournaments:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Navigate to tournament creation page
 */
export async function navigateToCreateTournamentAction(seriesId?: string) {
  if (seriesId) {
    redirect(`/tournaments/create?seriesId=${seriesId}`);
  } else {
    redirect('/tournaments/create');
  }
}

/**
 * Navigate to tournament edit page
 */
export async function navigateToEditTournamentAction(id: string) {
  redirect(`/tournaments/${id}/edit`);
}

/**
 * Navigate to tournament detail page
 */
export async function navigateToTournamentDetailAction(id: string) {
  redirect(`/tournaments/${id}`);
}
