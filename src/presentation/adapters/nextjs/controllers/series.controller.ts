'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { 
  CreateSeriesDTO, 
  UpdateSeriesDTO, 
  SeriesSearchDTO 
} from '../../../../core/application/dtos/series.dto';
import { ISeriesFacade } from '../../../../application-facade/interfaces/ISeriesFacade';

/**
 * Next.js Series Controller
 * Handles Next.js specific server actions for series operations
 * This is the ONLY file that should contain Next.js specific code for series
 */

// This will be injected via DI container
let seriesFacade: ISeriesFacade;

export function setSeriesFacade(facade: ISeriesFacade) {
  seriesFacade = facade;
}

/**
 * Create a new series
 */
export async function createSeriesAction(data: CreateSeriesDTO) {
  try {
    const result = await seriesFacade.createSeries(data);
    
    if (result.success && result.data) {
      revalidatePath('/series');
      revalidatePath(`/seasons/${data.seasonId}`);
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error || 'Failed to create series' };
  } catch (error) {
    console.error('Error creating series:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing series
 */
export async function updateSeriesAction(data: UpdateSeriesDTO) {
  try {
    const result = await seriesFacade.updateSeries(data);
    
    if (result.success && result.data) {
      revalidatePath('/series');
      revalidatePath(`/series/${data.id}`);
      revalidatePath(`/seasons/${result.data.seasonId}`);
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error || 'Failed to update series' };
  } catch (error) {
    console.error('Error updating series:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a series
 */
export async function deleteSeriesAction(id: string, userId: string) {
  try {
    // Get series data before deletion for revalidation
    const seriesResult = await seriesFacade.getSeries(id);
    const result = await seriesFacade.deleteSeries(id, userId);
    
    if (result.success) {
      revalidatePath('/series');
      if (seriesResult.success && seriesResult.data) {
        revalidatePath(`/seasons/${seriesResult.data.seasonId}`);
      }
      return { success: true };
    }
    
    return { success: false, error: result.error || 'Failed to delete series' };
  } catch (error) {
    console.error('Error deleting series:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a series by ID
 */
export async function getSeriesAction(id: string) {
  try {
    const result = await seriesFacade.getSeries(id);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error || 'Series not found' };
  } catch (error) {
    console.error('Error getting series:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all series with optional search
 */
export async function getAllSeriesAction(search?: SeriesSearchDTO) {
  try {
    const result = await seriesFacade.getAllSeries(search);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error || 'Failed to get series' };
  } catch (error) {
    console.error('Error getting series:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get series by season
 */
export async function getSeriesBySeasonAction(seasonId: string) {
  try {
    const result = await seriesFacade.getSeriesBySeason(seasonId);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error || 'Failed to get series' };
  } catch (error) {
    console.error('Error getting series by season:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get series by league
 */
export async function getSeriesByLeagueAction(leagueId: string) {
  try {
    const result = await seriesFacade.getSeriesByLeague(leagueId);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error || 'Failed to get series' };
  } catch (error) {
    console.error('Error getting series by league:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get active series
 */
export async function getActiveSeriesAction(seasonId?: string) {
  try {
    const result = await seriesFacade.getActiveSeries(seasonId);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error || 'Failed to get active series' };
  } catch (error) {
    console.error('Error getting active series:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get series summary
 */
export async function getSeriesSummaryAction(id: string) {
  try {
    const result = await seriesFacade.getSeriesSummary(id);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error || 'Failed to get series summary' };
  } catch (error) {
    console.error('Error getting series summary:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get series statistics
 */
export async function getSeriesStatsAction(id: string) {
  try {
    const result = await seriesFacade.getSeriesStats(id);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return { success: false, error: result.error || 'Failed to get series statistics' };
  } catch (error) {
    console.error('Error getting series statistics:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Toggle series active status
 */
export async function toggleSeriesStatusAction(id: string, isActive: boolean, userId: string) {
  try {
    const result = await seriesFacade.toggleSeriesStatus(id, isActive, userId);
    
    if (result.success) {
      revalidatePath('/series');
      revalidatePath(`/series/${id}`);
      return { success: true };
    }
    
    return { success: false, error: result.error || 'Failed to toggle series status' };
  } catch (error) {
    console.error('Error toggling series status:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Navigate to series creation page
 */
export async function navigateToCreateSeriesAction(seasonId: string) {
  redirect(`/series/create?seasonId=${seasonId}`);
}

/**
 * Navigate to series edit page
 */
export async function navigateToEditSeriesAction(id: string) {
  redirect(`/series/${id}/edit`);
}

/**
 * Navigate to series detail page
 */
export async function navigateToSeriesDetailAction(id: string) {
  redirect(`/series/${id}`);
}
