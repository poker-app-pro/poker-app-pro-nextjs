"use server";

import { 
  saveGameResultsAction, 
  getTournamentResultsAction, 
  getTournamentResultDetailsAction, 
  updateTournamentResultAction, 
  deleteTournamentResultAction 
} from "@/src/presentation/adapters/nextjs/controllers/results.controller";
import { 
  PlayerResultDto, 
  TournamentResultDto, 
  TournamentResultDetailsDto 
} from "@/src/application-facade/interfaces/IResultsFacade";
import { GameType } from "@/src/core/domain/entities/game-result.entity";

// Export types for use in components
export type PlayerResult = PlayerResultDto;
export type TournamentResult = TournamentResultDto;
export type TournamentResultDetails = TournamentResultDetailsDto;

export async function saveGameResults(formData: FormData) {
  return await saveGameResultsAction(formData);
}

export async function getTournamentResults() {
  const result = await getTournamentResultsAction();
  if (result.success && result.data) {
    return result.data;
  }
  throw new Error(result.error || "Failed to fetch tournament results");
}

export async function getTournamentResultDetails(tournamentId: string) {
  const result = await getTournamentResultDetailsAction(tournamentId);
  if (result.success && result.data) {
    return result.data;
  }
  throw new Error(result.error || "Failed to fetch tournament result details");
}

export async function updateTournamentResult(id: string, formData: FormData) {
  return await updateTournamentResultAction(id, formData);
}

export async function deleteTournamentResult(id: string) {
  return await deleteTournamentResultAction(id);
}
