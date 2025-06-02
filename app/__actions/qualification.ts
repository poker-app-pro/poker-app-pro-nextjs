"use server";

import { 
  getQualifiedPlayersAction, 
  getQualificationStatusAction, 
  getPreviousSeasonEventsAction, 
  recordSeasonEventFromFormAction 
} from "@/src/presentation/adapters/nextjs/controllers/qualification.controller";
import { getActiveSeasonsAction } from "@/src/presentation/adapters/nextjs/controllers/season.controller";
import { 
  QualifiedPlayerDto, 
  QualificationStatusDto, 
  SeasonEventDto, 
  SeasonEventResultDto 
} from "@/src/application-facade/interfaces/IQualificationFacade";

// Export types for use in components
export type QualifiedPlayer = QualifiedPlayerDto;
export type QualificationStatus = QualificationStatusDto;
export type SeasonEvent = SeasonEventDto;
export type SeasonEventResult = SeasonEventResultDto;

// Get all active seasons
export async function getActiveSeasons() {
  return await getActiveSeasonsAction();
}

// Get qualified players for a season
export async function getQualifiedPlayers(seasonId: string, searchQuery?: string) {
  return await getQualifiedPlayersAction(seasonId, searchQuery);
}

// Get qualification status for a season
export async function getQualificationStatus(seasonId: string) {
  return await getQualificationStatusAction(seasonId);
}

// Get previous season events
export async function getPreviousSeasonEvents(seasonId: string) {
  return await getPreviousSeasonEventsAction(seasonId);
}

// Record season event results
export async function recordSeasonEventResults(formData: FormData) {
  return await recordSeasonEventFromFormAction(formData);
}
