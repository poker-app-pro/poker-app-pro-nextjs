"use server"

import { cookieBasedClient } from "@/lib/amplify-utils"
import { 
  createSeriesAction, 
  deleteSeriesAction, 
  getSeriesAction,
  getAllSeriesAction,
  getSeriesBySeasonAction
} from "@/src/presentation/adapters/nextjs/controllers/series.controller"
import { getTournamentsBySeriesAction } from "@/src/presentation/adapters/nextjs/controllers/tournament.controller"
import { getAllSeasonsAction } from "@/src/presentation/adapters/nextjs/controllers/season.controller"
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
  return await getTournamentsBySeriesAction(seriesId)
}

export async function getSeasons() {
  return await getAllSeasonsAction()
}
