"use server"

import { revalidatePath } from "next/cache";
import { NextJSLeagueAdapter } from '@/src/adapters/nextjs/league.adapter';
import { ensureAmplifyInitialized } from '@/src/adapters/nextjs/amplify-client.adapter';
import amplifyConfig from "@/amplify_outputs.json";

// Initialize Amplify before any operations
ensureAmplifyInitialized({ config: amplifyConfig });

export async function createLeague(formData: FormData) {
  try {
    const result = await NextJSLeagueAdapter.createLeague(formData);
    
    if (result.success) {
      revalidatePath("/leagues");
    }
    
    return result;
  } catch (error) {
    console.error("Error in createLeague action:", error);
    return { success: false, error: "Failed to create league" };
  }
}

export async function getLeagues() {
  try {
    const result = await NextJSLeagueAdapter.getLeagues({ activeOnly: true });
    return result;
  } catch (error) {
    console.error("Error in getLeagues action:", error);
    return { success: false, error: "Failed to fetch leagues" };
  }
}

export async function getLeague(id: string) {
  try {
    const result = await NextJSLeagueAdapter.getLeague(id);
    return result;
  } catch (error) {
    console.error(`Error in getLeague action for id ${id}:`, error);
    return { success: false, error: "Failed to fetch league" };
  }
}

export async function updateLeague(id: string, formData: FormData) {
  try {
    // For now, we'll implement a basic update - this would need the UpdateLeagueUseCase
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "on";
    const imageUrl = formData.get("imageUrl") as string;
    const userId = formData.get("userId") as string;

    if (!name?.trim()) {
      return { success: false, error: "League name is required" };
    }

    // This is a simplified implementation - in a full refactor, 
    // we'd create an UpdateLeagueUseCase
    const container = await import('@/src/infrastructure/di/container').then(m => m.getContainer());
    const leagueRepository = container.getLeagueRepository();
    
    const updatedLeague = await leagueRepository.update({
      id,
      name: name.trim(),
      description: description?.trim() || undefined,
      isActive,
      imageUrl: imageUrl?.trim() || undefined
    });

    // Log activity
    const activityLogService = container.getActivityLogService();
    await activityLogService.logActivity(
      userId,
      'UPDATE',
      'League',
      id,
      { name: name.trim() }
    );

    revalidatePath("/leagues");
    revalidatePath(`/leagues/${id}`);
    
    return { success: true, data: updatedLeague };
  } catch (error) {
    console.error(`Error in updateLeague action for id ${id}:`, error);
    return { success: false, error: "Failed to update league" };
  }
}

export async function deleteLeague(id: string, userId: string) {
  try {
    // This is a simplified implementation - in a full refactor, 
    // we'd create a DeleteLeagueUseCase with proper business logic
    const container = await import('@/src/infrastructure/di/container').then(m => m.getContainer());
    const leagueRepository = container.getLeagueRepository();
    
    // Get the league first to check relationships
    const league = await leagueRepository.findById(id);
    
    if (!league) {
      return { success: false, error: "League not found" };
    }

    // Check if league has dependencies (simplified check)
    if (league.seasons && league.seasons.length > 0) {
      return {
        success: false,
        error: "Cannot delete league with existing seasons. Please delete all seasons first.",
      };
    }

    await leagueRepository.delete(id);

    // Log activity
    const activityLogService = container.getActivityLogService();
    await activityLogService.logActivity(
      userId,
      'DELETE',
      'League',
      id,
      { name: league.name }
    );

    revalidatePath("/leagues");
    return { success: true };
  } catch (error) {
    console.error(`Error in deleteLeague action for id ${id}:`, error);
    return { success: false, error: "Failed to delete league" };
  }
}
