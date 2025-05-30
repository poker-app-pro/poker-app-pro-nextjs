"use server"

import { cookieBasedClient } from "@/lib/amplify-utils"
import { 
  createSeriesAction, 
  deleteSeriesAction, 
  getSeriesAction,
  getAllSeriesAction,
  getSeriesBySeasonAction
} from "@/src/presentation/adapters/nextjs/controllers/series.controller"
import { CreateSeriesDTO } from "@/src/core/application/dtos/series.dto"

// Export controller methods with revalidation wrappers
export async function createSeries(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const seasonId = formData.get("seasonId") as string
    const startDate = new Date(formData.get("startDate") as string)
    const endDateStr = formData.get("endDate") as string
    const endDate = endDateStr ? new Date(endDateStr) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000) // Default to 90 days after start date
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "on"

    // Convert to DTO
    const data: CreateSeriesDTO = {
      name,
      seasonId,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      description,
      isActive
    };

    const result = await createSeriesAction(data)
    return result
  } catch (error) {
    console.error("Error creating series:", error)
    return { success: false, error: "Failed to create series" }
  }
}

export async function deleteSeries(id: string, userId: string) {
  const result = await deleteSeriesAction(id, userId)
  return result
}

export async function getSeries() {
  return await getAllSeriesAction()
}

export async function getSeriesById(id: string) {
  return await getSeriesAction(id)
}

export async function getSeriesBySeason(seasonId: string) {
  return await getSeriesBySeasonAction(seasonId)
}

export async function getTournamentsBySeries(seriesId: string) {
  // This should be moved to a tournaments controller in the future
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

// This function is still using the direct implementation since it's not part of the series controller
export async function getSeasons() {
  try {
    // This should be moved to a seasons controller in the future
    const result = await cookieBasedClient.models.Season.list({
      authMode: "userPool",
    })
    return { success: true, data: result.data }
  } catch (error) {
    console.error("Error fetching seasons:", error)
    return { success: false, error: "Failed to fetch seasons" }
  }
}
