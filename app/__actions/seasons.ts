"use server";

import {
  cookieBasedClient,
  runWithAmplifyServerContext,
} from "@/lib/amplify-utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "aws-amplify/auth/server";
import { cookies } from "next/headers";

export async function getSeasons() {
  try {
    const result = await cookieBasedClient.models.Season.list({
      authMode: "userPool",
    });
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return { success: false, error: "Failed to fetch seasons" };
  }
}

export async function getSeasonById(id: string) {
  try {
    const result = await cookieBasedClient.models.Season.get(
      { id },
      { authMode: "userPool" }
    );

    if (!result.data) {
      return { success: false, error: "Season not found" };
    }

    // Get league details
    const leagueResult = await cookieBasedClient.models.League.get(
      { id: result.data.leagueId },
      { authMode: "userPool" }
    );

    return {
      success: true,
      data: {
        ...result.data,
        leagueName: leagueResult.data?.name || "Unknown League",
      },
    };
  } catch (error) {
    console.error("Error fetching season:", error);
    return { success: false, error: "Failed to fetch season" };
  }
}

export async function getLeagues() {
  try {
    const result = await cookieBasedClient.models.League.list({
      authMode: "userPool",
    });
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return { success: false, error: "Failed to fetch leagues" };
  }
}

export async function createSeason(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string;
    const leagueId = formData.get("leagueId") as string;
    const startDate = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const endDate = endDateStr ? endDateStr : undefined;
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

    // Create the season
    const result = await cookieBasedClient.models.Season.create(
      {
        name,
        leagueId,
        startDate,
        endDate,
        description,
        isActive,
        userId,
        series: [],
        tournaments: [],
        scoreboards: [],
        qualifications: [],
      },
      {
        authMode: "userPool",
      }
    );

    // Update the league's seasons array
    if (result.data?.id) {
      try {
        const leagueResult = await cookieBasedClient.models.League.get({
          id: leagueId,
        });
        if (leagueResult.data) {
          await cookieBasedClient.models.League.update(
            {
              id: leagueId,
              seasons: [...(leagueResult.data.seasons || []), result.data.id],
            },
            {
              authMode: "userPool",
            }
          );
        }
      } catch (leagueError) {
        console.error("Error updating league seasons:", leagueError);
        // Continue even if league update fails
      }

      // Update the user's seasons array
      try {
        const userResult = await cookieBasedClient.models.User.get({
          id: userId,
        });
        if (userResult.data) {
          await cookieBasedClient.models.User.update(
            {
              id: userId,
              seasons: [...(userResult.data.seasons || []), result.data.id],
            },
            {
              authMode: "userPool",
            }
          );
        }
      } catch (userError) {
        console.error("Error updating user seasons:", userError);
        // Continue even if user update fails
      }

      // Log activity
      try {
        await cookieBasedClient.models.ActivityLog.create(
          {
            userId,
            action: "CREATE",
            entityType: "Season",
            entityId: result.data.id,
            details: { name, leagueId },
            timestamp: new Date().toISOString(),
          },
          {
            authMode: "userPool",
          }
        );
      } catch (logError) {
        console.error("Error logging activity:", logError);
        // Continue even if logging fails
      }
    }

    revalidatePath("/seasons");
    return { success: true, data: result.data };
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
    const endDate = endDateStr ? endDateStr : undefined;
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

    // Get current season data
    const currentSeasonResult = await cookieBasedClient.models.Season.get({
      id: seasonId,
    });
    if (!currentSeasonResult.data) {
      return { success: false, error: "Season not found" };
    }

    // Update the season
    const result = await cookieBasedClient.models.Season.update(
      {
        id: seasonId,
        name,
        startDate,
        endDate,
        description,
        isActive,
      },
      {
        authMode: "userPool",
      }
    );

    if (!result.data) {
      return { success: false, error: "Failed to update season" };
    }

    // Log activity
    try {
      await cookieBasedClient.models.ActivityLog.create(
        {
          userId,
          action: "UPDATE",
          entityType: "Season",
          entityId: seasonId,
          details: { name, startDate, endDate, isActive },
          timestamp: new Date().toISOString(),
        },
        {
          authMode: "userPool",
        }
      );
    } catch (logError) {
      console.error("Error logging activity:", logError);
      // Continue even if logging fails
    }

    revalidatePath("/seasons");
    revalidatePath(`/seasons/${seasonId}`);
    return { success: true, data: result.data };
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

    // Get current season data to get related entities
    const currentSeasonResult = await cookieBasedClient.models.Season.get({
      id: seasonId,
    });
    if (!currentSeasonResult.data) {
      return { success: false, error: "Season not found" };
    }

    const season = currentSeasonResult.data;
    const leagueId = season.leagueId;

    // Check if season has series
    if (season.series && season.series.length > 0) {
      return {
        success: false,
        error:
          "Cannot delete season with existing series. Please delete all series first.",
      };
    }

    // Delete the season
    await cookieBasedClient.models.Season.delete(
      { id: seasonId },
      { authMode: "userPool" }
    );

    // Update the league's seasons array
    try {
      const leagueResult = await cookieBasedClient.models.League.get({
        id: leagueId,
      });
      if (leagueResult.data && leagueResult.data.seasons) {
        const updatedSeasons = leagueResult.data.seasons.filter(
          (id) => id !== seasonId
        );
        await cookieBasedClient.models.League.update(
          {
            id: leagueId,
            seasons: updatedSeasons,
          },
          {
            authMode: "userPool",
          }
        );
      }
    } catch (leagueError) {
      console.error("Error updating league seasons:", leagueError);
      // Continue even if league update fails
    }

    // Update the user's seasons array
    try {
      const userResult = await cookieBasedClient.models.User.get({
        id: userId,
      });
      if (userResult.data && userResult.data.seasons) {
        const updatedSeasons = userResult.data.seasons.filter(
          (id) => id !== seasonId
        );
        await cookieBasedClient.models.User.update(
          {
            id: userId,
            seasons: updatedSeasons,
          },
          {
            authMode: "userPool",
          }
        );
      }
    } catch (userError) {
      console.error("Error updating user seasons:", userError);
      // Continue even if user update fails
    }

    // Log activity
    try {
      await cookieBasedClient.models.ActivityLog.create(
        {
          userId,
          action: "DELETE",
          entityType: "Season",
          entityId: seasonId,
          details: { name: season.name },
          timestamp: new Date().toISOString(),
        },
        {
          authMode: "userPool",
        }
      );
    } catch (logError) {
      console.error("Error logging activity:", logError);
      // Continue even if logging fails
    }

    revalidatePath("/seasons");
    return { success: true };
  } catch (error) {
    console.error("Error deleting season:", error);
    return { success: false, error: "Failed to delete season" };
  }
}
