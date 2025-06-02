"use server";

import { 
  getStandingsAction, 
  getSeriesStandingsAction 
} from "@/src/presentation/adapters/nextjs/controllers/standings.controller";
import { 
  StandingsDataDto, 
  DetailedSeriesStandingsDto, 
  StandingEntryDto, 
  DetailedStandingEntryDto 
} from "@/src/application-facade/interfaces/IStandingsFacade";

// Export types for use in components
export type StandingsData = StandingsDataDto;
export type StandingEntry = StandingEntryDto;
export type DetailedStandingEntry = DetailedStandingEntryDto;

export async function getStandings() {
  return await getStandingsAction();
}

export async function getSeriesStandings(seriesId: string) {
  return await getSeriesStandingsAction(seriesId);
}
