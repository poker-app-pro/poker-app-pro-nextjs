"use server";

import { cookieBasedClient } from "@/lib/amplify-utils";
import { revalidatePath } from "next/cache";

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
        const leagueResult = await cookieBasedClient.models.League.get(
          { id: leagueId },
          { authMode: "userPool" }
        );
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
        const userResult = await cookieBasedClient.models.User.get(
          { id: userId },
          { authMode: "userPool" }
        );
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
