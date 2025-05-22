"use server"

import { cookieBasedClient } from "@/lib/amplify-utils"
import { revalidatePath } from "next/cache"

export async function getSeries() {
  try {
    const result = await cookieBasedClient.models.Series.list({
      authMode: "userPool",
    })
    return { success: true, data: result.data }
  } catch (error) {
    console.error("Error fetching series:", error)
    return { success: false, error: "Failed to fetch series" }
  }
}

export async function getSeriesBySeason(seasonId: string) {
  try {
    const result = await cookieBasedClient.models.Series.list({
      authMode: "userPool",
    })
    const filteredSeries = result.data.filter((series) => series.seasonId === seasonId)

    // For each series, get tournament count
    const seriesWithDetails = await Promise.all(
      filteredSeries.map(async (series) => {
        // Get tournaments for this series
        const tournamentsResult = await cookieBasedClient.models.Tournament.list({
          filter: { seriesId: { eq: series.id } },
          authMode: "userPool",
        })

        return {
          ...series,
          tournaments: tournamentsResult.data || [],
        }
      }),
    )

    return { success: true, data: seriesWithDetails }
  } catch (error) {
    console.error("Error fetching series by season:", error)
    return { success: false, error: "Failed to fetch series" }
  }
}

export async function getSeriesById(id: string) {
  try {
    const result = await cookieBasedClient.models.Series.get({ id }, { authMode: "userPool" })

    if (!result.data) {
      return { success: false, error: "Series not found" }
    }

    // Get season and league details
    const seasonResult = await cookieBasedClient.models.Season.get(
      { id: result.data.seasonId },
      { authMode: "userPool" },
    )

    const leagueResult = await cookieBasedClient.models.League.get(
      { id: result.data.leagueId },
      { authMode: "userPool" },
    )

    return {
      success: true,
      data: {
        ...result.data,
        seasonName: seasonResult.data?.name || "Unknown Season",
        leagueName: leagueResult.data?.name || "Unknown League",
      },
    }
  } catch (error) {
    console.error("Error fetching series:", error)
    return { success: false, error: "Failed to fetch series" }
  }
}

export async function getSeasons() {
  try {
    const result = await cookieBasedClient.models.Season.list({
      authMode: "userPool",
    })
    return { success: true, data: result.data }
  } catch (error) {
    console.error("Error fetching seasons:", error)
    return { success: false, error: "Failed to fetch seasons" }
  }
}

export async function getTournamentsBySeries(seriesId: string) {
  try {
    const result = await cookieBasedClient.models.Tournament.list({
      authMode: "userPool",
    })
    const filteredTournaments = result.data.filter((tournament) => tournament.seriesId === seriesId)

    // For each tournament, get the winner's name
    const tournamentsWithWinners = await Promise.all(
      filteredTournaments.map(async (tournament) => {
        // Get tournament players
        const tournamentPlayersResult = await cookieBasedClient.models.TournamentPlayer.list({
          filter: { tournamentId: { eq: tournament.id } },
          authMode: "userPool",
        })

        // Find the winner (position 1)
        const winner = tournamentPlayersResult.data.find((tp) => tp.finalPosition === 1)
        let winnerName = "No winner"

        if (winner && winner.playerId) {
          const playerResult = await cookieBasedClient.models.Player.get(
            { id: winner.playerId },
            { authMode: "userPool" },
          )
          if (playerResult.data) {
            winnerName = playerResult.data.name
          }
        }

        return {
          ...tournament,
          winnerName,
        }
      }),
    )

    return { success: true, data: tournamentsWithWinners }
  } catch (error) {
    console.error("Error fetching tournaments:", error)
    return { success: false, error: "Failed to fetch tournaments" }
  }
}

export async function createSeries(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const seasonId = formData.get("seasonId") as string
    const leagueId = formData.get("leagueId") as string
    const startDate = new Date(formData.get("startDate") as string)
    const endDateStr = formData.get("endDate") as string
    const endDate = endDateStr ? new Date(endDateStr) : undefined
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "on"
    const pointsSystem = formData.get("pointsSystem") as string
    const customPointsConfigStr = formData.get("customPointsConfig") as string
    const customPointsConfig =
      pointsSystem === "custom" && customPointsConfigStr ? JSON.parse(customPointsConfigStr) : undefined
    const userId = formData.get("userId") as string

    // Validate required fields
    if (!name || !seasonId || !leagueId || !startDate || !userId) {
      return {
        success: false,
        error: "Missing required fields",
      }
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
      },
    )

    if (!result || !result.data) {
      console.error("Failed to create series:", result.errors)
      throw new Error("Failed to create series")
    }

    // Update the season to include this series
    const season = await cookieBasedClient.models.Season.get({ id: seasonId }, { authMode: "userPool" })
    if (season && season.data) {
      const updatedSeries = [...(season.data.series || []), result.data.id]
      await cookieBasedClient.models.Season.update(
        {
          id: seasonId,
          series: updatedSeries,
        },
        {
          authMode: "userPool",
        },
      )
    }

    // Update the league to include this series
    const league = await cookieBasedClient.models.League.get({ id: leagueId }, {
      authMode: "userPool",
    })
    if (league && league.data) {
      const updatedSeries = [...(league.data.series || []), result.data.id]
      await cookieBasedClient.models.League.update(
        {
          id: leagueId,
          series: updatedSeries,
        },
        {
          authMode: "userPool",
        },
      )
    }

    // Update user's series list
    try {
      const user = await cookieBasedClient.models.User.get({ id: userId }, {authMode: "userPool"})
      if (user && user.data) {
        await cookieBasedClient.models.User.update(
          {
            id: userId,
            series: [...(user.data.series || []), result.data.id],
          },
          {
            authMode: "userPool",
          },
        )
      }
    } catch (userError) {
      console.error("Error updating user series list:", userError)
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
        },
      )
    } catch (logError) {
      console.error("Error logging activity:", logError)
      // Continue execution even if logging fails
    }

    revalidatePath("/series")
    revalidatePath(`/seasons/${seasonId}`)
    return { success: true, data: result.data }
  } catch (error) {
    console.error("Error creating series:", error)
    return { success: false, error: "Failed to create series" }
  }
}


export async function deleteSeries(id: string, userId: string) {
  try {
    // Get the series first to check relationships
    const seriesResult = await cookieBasedClient.models.Series.get({ id }, { authMode: "userPool" })

    if (!seriesResult.data) {
      return { success: false, error: "Series not found" }
    }

    const series = seriesResult.data

    // Check if series has tournaments
    if (series.tournaments && series.tournaments.length > 0) {
      return {
        success: false,
        error: "Cannot delete series with existing tournaments. Please delete all tournaments first.",
      }
    }

    // Remove series from season
    if (series.seasonId) {
      try {
        const seasonResult = await cookieBasedClient.models.Season.get(
          { id: series.seasonId },
          { authMode: "userPool" },
        )

        if (seasonResult.data) {
          const updatedSeries = (seasonResult.data.series || []).filter((seriesId) => seriesId !== id)

          await cookieBasedClient.models.Season.update(
            {
              id: series.seasonId,
              series: updatedSeries,
            },
            {
              authMode: "userPool",
            },
          )
        }
      } catch (seasonError) {
        console.error("Error updating season series:", seasonError)
        // Continue even if season update fails
      }
    }

    // Remove series from league
    if (series.leagueId) {
      try {
        const leagueResult = await cookieBasedClient.models.League.get(
          { id: series.leagueId },
          { authMode: "userPool" },
        )

        if (leagueResult.data) {
          const updatedSeries = (leagueResult.data.series || []).filter((seriesId) => seriesId !== id)

          await cookieBasedClient.models.League.update(
            {
              id: series.leagueId,
              series: updatedSeries,
            },
            {
              authMode: "userPool",
            },
          )
        }
      } catch (leagueError) {
        console.error("Error updating league series:", leagueError)
        // Continue even if league update fails
      }
    }

    // Delete scoreboards associated with this series
    if (series.scoreboards && series.scoreboards.length > 0) {
      for (const scoreboardId of series.scoreboards) {
        await cookieBasedClient.models.Scoreboard.delete(
          { id: scoreboardId as string },
          {
            authMode: "userPool",
          },
        )
      }
    }

    // Delete the series
    await cookieBasedClient.models.Series.delete(
      { id },
      {
        authMode: "userPool",
      },
    )

    // Update the user's series array
    try {
      const userResult = await cookieBasedClient.models.User.get(
        { id: userId },
        {
          authMode: "userPool",
        },
      )

      if (userResult.data) {
        const updatedSeries = (userResult.data.series || []).filter((seriesId) => seriesId !== id)

        await cookieBasedClient.models.User.update(
          {
            id: userId,
            series: updatedSeries,
          },
          {
            authMode: "userPool",
          },
        )
      }
    } catch (userError) {
      console.error("Error updating user series:", userError)
      // Continue even if user update fails
    }

    // Log activity
    try {
      await cookieBasedClient.models.ActivityLog.create(
        {
          userId,
          action: "DELETE",
          entityType: "Series",
          entityId: id,
          details: { name: series.name },
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

    revalidatePath("/series")
    return { success: true }
  } catch (error) {
    console.error("Error deleting series:", error)
    return { success: false, error: "Failed to delete series" }
  }
}

