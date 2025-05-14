"use server"

import { cookieBasedClient } from "@/lib/amplify-utils"
 import { revalidatePath } from "next/cache"

export async function createLeague(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "on"
    const imageUrl = formData.get("imageUrl") as string
    const userId = formData.get("userId") as string

    // Validate required fields
    if (!name.trim()) {
      return { success: false, error: "League name is required" }
    }

    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    // Create the league
    const result = await cookieBasedClient.models.League.create(
      {
        name,
        description,
        isActive,
        imageUrl,
        userId,
        seasons: [],
        series: [],
        tournaments: [],
        scoreboards: [],
        qualifications: [],
        leagueSettings: [],
      },
      {
        authMode: "userPool",
      },
    )

    // Create default league settings
    if (result.data?.id) {
      await cookieBasedClient.models.LeagueSettings.create(
        {
          leagueId: result.data.id,
          defaultPointsSystem: "standard",
          defaultGameType: "Texas Hold'em",
          defaultBuyIn: 0,
          defaultStartingChips: 1000,
          defaultBlindStructure: "15 minutes",
        },
        {
          authMode: "userPool",
        },
      )

      // Update the user's leagues array
      try {
        const userResult = await cookieBasedClient.models.User.get({ id: userId },
          {
            authMode: "userPool",
          })
        if (userResult.data) {
          await cookieBasedClient.models.User.update(
            {
              id: userId,
              leagues: [...(userResult.data.leagues || []), result.data.id],
            },
            {
              authMode: "userPool",
            },
          )
        }
      } catch (userError) {
        console.error("Error updating user leagues:", userError)
        // Continue even if user update fails
      }

      // Log activity
      try {
        await cookieBasedClient.models.ActivityLog.create(
          {
            userId,
            action: "CREATE",
            entityType: "League",
            entityId: result.data.id,
            details: { name },
            timestamp: new Date().toISOString(),
          },
          {
            authMode: "userPool",
          },
        )
      } catch (logError) {
        console.error("Error logging activity:", logError)
        // Continue even if logging fails
      }
    }

    revalidatePath("/leagues")
    return { success: true, data: result.data }
  } catch (error) {
    console.error("Error creating league:", error)
    return { success: false, error: "Failed to create league" }
  }
}

export async function getLeagues() {
  try {
    const result = await cookieBasedClient.models.League.list({
      filter: { isActive: { eq: true } },
      authMode: "userPool",
     })
    return { success: true, data: result.data }
  } catch (error) {
    console.error("Error fetching leagues:", error)
    return { success: false, error: "Failed to fetch leagues" }
  }
}

export async function getLeague(id: string) {
  try {
    const result = await cookieBasedClient.models.League.get({ id }, {authMode: "userPool",})
    return { success: true, data: result.data }
  } catch (error) {
    console.error(`Error fetching league ${id}:`, error)
    return { success: false, error: "Failed to fetch league" }
  }
}

export async function updateLeague(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "on"
    const imageUrl = formData.get("imageUrl") as string
    const userId = formData.get("userId") as string

    // Validate required fields
    if (!name.trim()) {
      return { success: false, error: "League name is required" }
    }

    const result = await cookieBasedClient.models.League.update(
      {
        id,
        name,
        description,
        isActive,
        imageUrl,
      },
      {
        authMode: "userPool",
      },
    )

    // Log activity
    try {
      await cookieBasedClient.models.ActivityLog.create(
        {
          userId,
          action: "UPDATE",
          entityType: "League",
          entityId: id,
          details: { name },
          timestamp: new Date().toISOString(),
        },
        {
          authMode: "userPool",
        },
      )
    } catch (logError) {
      console.error("Error logging activity:", logError)
      // Continue even if logging fails
    }

    revalidatePath("/leagues")
    revalidatePath(`/leagues/${id}`)
    return { success: true, data: result.data }
  } catch (error) {
    console.error(`Error updating league:`, error)
    return { success: false, error: "Failed to update league" }
  }
}

export async function deleteLeague(id: string, userId: string) {
  try {
    // Get the league first to check relationships
    const leagueResult = await cookieBasedClient.models.League.get({ id }, {authMode: "userPool",})
    const league = leagueResult.data

    if (!league) {
      return { success: false, error: "League not found" }
    }

    // Check if league has seasons
    if (league.seasons && league.seasons.length > 0) {
      return {
        success: false,
        error: "Cannot delete league with existing seasons. Please delete all seasons first.",
      }
    }

    // Check if league has series
    if (league.series && league.series.length > 0) {
      return {
        success: false,
        error: "Cannot delete league with existing series. Please delete all series first.",
      }
    }

    // Check if league has tournaments
    if (league.tournaments && league.tournaments.length > 0) {
      return {
        success: false,
        error: "Cannot delete league with existing tournaments. Please delete all tournaments first.",
      }
    }

    // Delete league settings
    if (league.leagueSettings && league.leagueSettings.length > 0) {
      for (const settingId of league.leagueSettings) {
        await cookieBasedClient.models.LeagueSettings.delete(
          { id: settingId as string },
          {
            authMode: "userPool",
          },
        )
      }
    }

    // Delete the league
    await cookieBasedClient.models.League.delete(
      { id },
      {
        authMode: "userPool",
      },
    )

    // Update the user's leagues array
    try {
      const userResult = await cookieBasedClient.models.User.get({ id: userId },
        {
          authMode: "userPool",
        })
      if (userResult.data) {
        const updatedLeagues = (userResult.data.leagues || []).filter((leagueId) => leagueId !== id)
        await cookieBasedClient.models.User.update(
          {
            id: userId,
            leagues: updatedLeagues,
          },
          {
            authMode: "userPool",
          },
        )
      }
    } catch (userError) {
      console.error("Error updating user leagues:", userError)
      // Continue even if user update fails
    }

    // Log activity
    try {
      await cookieBasedClient.models.ActivityLog.create(
        {
          userId,
          action: "DELETE",
          entityType: "League",
          entityId: id,
          details: { name: league.name },
          timestamp: new Date().toISOString(),
        },
        {
          authMode: "userPool",
        },
      )
    } catch (logError) {
      console.error("Error logging activity:", logError)
      // Continue even if logging fails
    }

    revalidatePath("/leagues")
    return { success: true }
  } catch (error) {
    console.error(`Error deleting league:`, error)
    return { success: false, error: "Failed to delete league" }
  }
}
