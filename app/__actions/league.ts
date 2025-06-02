"use server"

import { 
  createLeagueAction, 
  updateLeagueAction, 
  deleteLeagueAction, 
  getAllLeaguesAction, 
  getLeagueAction
} from "@/src/presentation/adapters/nextjs/controllers/league.controller"
import { CreateLeagueDTO, UpdateLeagueDTO, LeagueSearchDTO } from "@/src/core/application/dtos/league.dto"

export async function createLeague(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const ownerId = formData.get("ownerId") as string
    const isActive = formData.get("isActive") === "on"

    // Validate required fields
    if (!name.trim()) {
      return { success: false, error: "League name is required" }
    }

    if (!ownerId) {
      return { success: false, error: "Owner ID is required" }
    }

    // Convert to DTO
    const data: CreateLeagueDTO = {
      name,
      description,
      ownerId,
      isActive
    }

    return await createLeagueAction(data)
  } catch (error) {
    console.error("Error creating league:", error)
    return { success: false, error: "Failed to create league" }
  }
}

export async function updateLeague(id: string, formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const isActive = formData.get("isActive") === "on"

    // Validate required fields
    if (!name.trim()) {
      return { success: false, error: "League name is required" }
    }

    // Convert to DTO
    const data: UpdateLeagueDTO = {
      id,
      name,
      description,
      isActive
    }

    return await updateLeagueAction(data)
  } catch (error) {
    console.error("Error updating league:", error)
    return { success: false, error: "Failed to update league" }
  }
}

export async function deleteLeague(id: string, userId: string) {
  return await deleteLeagueAction(id, userId)
}

export async function getLeague(id: string) {
  return await getLeagueAction(id)
}

export async function getLeagues() {
  return await getAllLeaguesAction()
}

export async function searchLeagues(searchParams: any) {
  const search: LeagueSearchDTO = {
    searchTerm: searchParams.searchTerm,
    ownerId: searchParams.ownerId,
    isActive: searchParams.isActive === "true" ? true : undefined,
    page: searchParams.page ? parseInt(searchParams.page) : undefined,
    pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize) : undefined
  }
  
  return await getAllLeaguesAction(search)
}
