/**
 * Standings Facade Interface
 * Framework-agnostic interface for standings operations
 */

export interface StandingEntryDto {
  id: string;
  playerId: string;
  playerName: string;
  totalPoints: number;
  regularPoints: number;
  bountyPoints: number;
  consolationPoints: number;
  tournamentCount: number;
  bestFinish: number;
}

export interface SeriesStandingsDto {
  id: string;
  name: string;
  standings: StandingEntryDto[];
}

export interface SeasonStandingsDto {
  id: string;
  name: string;
  league: {
    id: string;
    name: string;
  };
  series: SeriesStandingsDto[];
}

export interface StandingsDataDto {
  seasons: SeasonStandingsDto[];
}

export interface TournamentResultDto {
  id: string;
  tournamentId: string;
  tournamentName: string;
  date: string;
  finalPosition: number;
  points: number;
  bountyPoints: number;
  consolationPoints: number;
}

export interface DetailedStandingEntryDto extends StandingEntryDto {
  tournamentResults: TournamentResultDto[];
}

export interface DetailedSeriesStandingsDto {
  series: {
    id: string;
    name: string;
    seasonId: string;
  };
  season: {
    id: string;
    name: string;
    leagueId: string;
  } | null;
  league: {
    id: string;
    name: string;
  } | null;
  standings: DetailedStandingEntryDto[];
}

export interface IStandingsFacade {
  /**
   * Get standings for all active seasons
   */
  getStandings(): Promise<{ 
    success: boolean; 
    data?: StandingsDataDto; 
    error?: string 
  }>;

  /**
   * Get detailed standings for a specific series
   */
  getSeriesStandings(seriesId: string): Promise<{ 
    success: boolean; 
    data?: DetailedSeriesStandingsDto; 
    error?: string 
  }>;
}
