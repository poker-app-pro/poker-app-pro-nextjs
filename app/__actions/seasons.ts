"use server";

import { 
  getAllSeasonsAction, 
  getSeasonWithLeagueAction, 
  createSeasonAction, 
  updateSeasonAction, 
  deleteSeasonAction 
} from "@/src/presentation/adapters/nextjs/controllers/season.controller";
import { getAllLeaguesAction } from "@/src/presentation/adapters/nextjs/controllers/league.controller";
import { CreateSeasonDTO, UpdateSeasonDTO } from "@/src/core/application/dtos/season.dto";
import { getCurrentUser } from "aws-amplify/auth/server";
import { cookies } from "next/headers";
import { cookieBasedClient, runWithAmplifyServerContext } from "@/lib/amplify-utils";

export async function getSeasons() {
  return await getAllSeasonsAction();
}

export async function getSeasonById(id: string) {
  return await getSeasonWithLeagueAction(id);
}


export async function createSeason(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string;
    const leagueId = formData.get("leagueId") as string;
    const startDate = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const endDate = endDateStr || undefined;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "on";
    const userId = formData.get("userId") as string;

    // Validate required fields
    if (!name.trim()) {
      return { success: false, error: "Season name is required" };
    }

    if (!leagueId) {
      return { success: false, error: "League is required" };
    }

    if (!startDate) {
      return { success: false, error: "Start date is required" };
    }

    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // Validate end date is after start date
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return { success: false, error: "End date must be after start date" };
    }

    // Convert to DTO
    const data: CreateSeasonDTO = {
      name,
      leagueId,
      startDate,
      endDate: endDate || startDate, // Ensure endDate is not undefined
      description,
      isActive
    };

    return await createSeasonAction(data);
  } catch (error) {
    console.error("Error creating season:", error);
    return { success: false, error: "Failed to create season" };
  }
}

export async function updateSeason(seasonId: string, formData: FormData) {
  try {
    // Get current user
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => getCurrentUser(contextSpec),
    });
    const userId = currentUser.userId;

    // Extract form data
    const name = formData.get("name") as string;
    const startDate = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const endDate = endDateStr || undefined;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "on";

    // Validate required fields
    if (!name.trim()) {
      return { success: false, error: "Season name is required" };
    }

    if (!startDate) {
      return { success: false, error: "Start date is required" };
    }

    // Validate end date is after start date
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return { success: false, error: "End date must be after start date" };
    }

    // Convert to DTO
    const data: UpdateSeasonDTO = {
      id: seasonId,
      name,
      startDate,
      endDate: endDate || startDate, // Ensure endDate is not undefined
      description,
      isActive
    };

    return await updateSeasonAction(data);
  } catch (error) {
    console.error("Error updating season:", error);
    return { success: false, error: "Failed to update season" };
  }
}

export async function deleteSeason(seasonId: string) {
  try {
    // Get current user
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: async (contextSpec) => getCurrentUser(contextSpec),
    });
    const userId = currentUser.userId;

    return await deleteSeasonAction(seasonId, userId);
  } catch (error) {
    console.error("Error deleting season:", error);
    return { success: false, error: "Failed to delete season" };
  }
}

export async function getLeagues() {
  return await getAllLeaguesAction();
}
