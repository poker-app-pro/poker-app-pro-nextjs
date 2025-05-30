"use server";

import { cookieBasedClient } from "@/lib/amplify-utils";
import { revalidatePath } from "next/cache";

export async function getSeries() {
  try {
    const result = await cookieBasedClient.models.Series.list({
      authMode: "userPool",
    });
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error fetching series:", error);
    return { success: false, error: "Failed to fetch series" };
  }
}

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

export async function getTournamentsBySeries(seriesId: string) {
  try {
    const result = await cookieBasedClient.models.Tournament.list({
      authMode: "userPool",
    });
    const filteredTournaments = result.data.filter(
      (tournament) => tournament.seriesId === seriesId
    );
    return { success: true, data: filteredTournaments };
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return { success: false, error: "Failed to fetch tournaments" };
  }
}

export async function createSeries(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string;
    const seasonId = formData.get("seasonId") as string;
    const leagueId = formData.get("leagueId") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDateStr = formData.get("endDate") as string;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "on";
    const pointsSystem = formData.get("pointsSystem") as string;
    const customPointsConfigStr = formData.get("customPointsConfig") as string;
    const customPointsConfig =
      pointsSystem === "custom" && customPointsConfigStr
        ? JSON.parse(customPointsConfigStr)
        : undefined;
    const userId = formData.get("userId") as string;

    // Validate required fields
    if (!name || !seasonId || !leagueId || !startDate || !userId) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Create the series
    const result = await cookieBasedClient.models.Series.create(
      {
        name,
        seasonId,
        leagueId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
        description,
        isActive,
        pointsSystem,
        customPointsConfig,
        userId,
        tournaments: [],
        scoreboards: [],
      },
      {
        authMode: "userPool",
      }
    );

    if (!result || !result.data) {
      console.error("Failed to create series:", result.errors);
      throw new Error("Failed to create series");
    }

    // Update the season to include this series
    const season = await cookieBasedClient.models.Season.get(
      { id: seasonId },
      {
        authMode: "userPool",
      }
    );
    if (season && season.data) {
      const updatedSeries = [...(season.data.series || []), result.data.id];
      await cookieBasedClient.models.Season.update(
        {
          id: seasonId,
          series: updatedSeries,
        },
        {
          authMode: "userPool",
        }
      );
    }

    // Update the league to include this series
    const league = await cookieBasedClient.models.League.get(
      { id: leagueId },
      {
        authMode: "userPool",
      }
    );
    if (league && league.data) {
      const updatedSeries = [...(league.data.series || []), result.data.id];
      await cookieBasedClient.models.League.update(
        {
          id: leagueId,
          series: updatedSeries,
        },
        {
          authMode: "userPool",
        }
      );
    }

    // Update user's series list
    try {
      const user = await cookieBasedClient.models.User.get(
        { id: userId },
        {
          authMode: "userPool",
        }
      );
      if (user && user.data) {
        await cookieBasedClient.models.User.update(
          {
            id: userId,
            series: [...(user.data.series || []), result.data.id],
          },
          {
            authMode: "userPool",
          }
        );
      }
    } catch (userError) {
      console.error("Error updating user series list:", userError);
      // Continue execution even if user update fails
    }

    // Log activity
    try {
      await cookieBasedClient.models.ActivityLog.create(
        {
          userId,
          action: "CREATE",
          entityType: "Series",
          entityId: result.data.id,
          details: {
            name,
            seasonId,
            leagueId,
          },
          timestamp: new Date().toISOString(),
        },
        {
          authMode: "userPool",
        }
      );
    } catch (logError) {
      console.error("Error logging activity:", logError);
      // Continue execution even if logging fails
    }

    revalidatePath("/series");
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error creating series:", error);
    return { success: false, error: "Failed to create series" };
  }
}
