/**
 * Season Data Transfer Objects
 * Framework-agnostic data structures for season operations
 */

export interface CreateSeasonDTO {
  name: string;
  leagueId: string;
  startDate: string;
  endDate: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSeasonDTO {
  id: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isActive?: boolean;
}

export interface SeasonDTO {
  id: string;
  name: string;
  leagueId: string;
  startDate: string;
  endDate: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isCurrentlyActive: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
  durationInDays: number;
}

export interface SeasonListDTO {
  seasons: SeasonDTO[];
  totalCount: number;
}

export interface SeasonSearchDTO {
  searchTerm?: string;
  leagueId?: string;
  isActive?: boolean;
  isCurrentlyActive?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface SeasonWithLeagueDTO extends SeasonDTO {
  leagueName: string;
}
