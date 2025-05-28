/**
 * League Data Transfer Objects
 * Framework-agnostic data structures for league operations
 */

export interface CreateLeagueDTO {
  name: string;
  description?: string;
  ownerId: string;
  isActive?: boolean;
}

export interface UpdateLeagueDTO {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface LeagueDTO {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeagueListDTO {
  leagues: LeagueDTO[];
  totalCount: number;
}

export interface LeagueSearchDTO {
  searchTerm?: string;
  ownerId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}
