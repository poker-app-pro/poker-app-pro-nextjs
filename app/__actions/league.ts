"use server"

import { revalidatePath } from "next/cache"
import { 
  createLeague as createLeagueController, 
  updateLeague as updateLeagueController, 
  deleteLeague as deleteLeagueController, 
  getLeagues as getLeaguesController, 
  getLeague as getLeagueController,
  searchLeagues as searchLeaguesController
} from "@/src/presentation/adapters/nextjs/controllers/league.controller"

// Export controller methods with revalidation wrappers
export async function createLeague(formData: FormData) {
  const result = await createLeagueController(formData)
  if (result.success) {
    revalidatePath("/leagues")
  }
  return result
}

export async function updateLeague(id: string, formData: FormData) {
  const result = await updateLeagueController(id, formData)
  if (result.success) {
    revalidatePath("/leagues")
    revalidatePath(`/leagues/${id}`)
  }
  return result
}

export async function deleteLeague(id: string, userId: string) {
  const result = await deleteLeagueController(id, userId)
  if (result.success) {
    revalidatePath("/leagues")
  }
  return result
}

export async function getLeague(id: string) {
  return await getLeagueController(id)
}

export async function getLeagues() {
  const result = await getLeaguesController()
  return result
}

export async function searchLeagues(searchParams: any) {
  return await searchLeaguesController(searchParams)
}
