import { GameType } from '@/src/core/domain/entities/game-result.entity';

/**
 * Results Facade Interface
 * Framework-agnostic interface for tournament results operations
 */

export interface PlayerResultDto {
  id: string;
  playerId: string;
  playerName: string;
  position: number | null;
  points: number;
  bountyCount: number;
  isConsolation: boolean;
}

export interface TournamentResultDto {
  id: string;
  name: string;
  seriesName: string;
  gameTime: string;
  location: string;
  totalPlayers: number;
  winner: string;
  createdAt: string;
}

export interface TournamentResultDetailsDto {
  id: string;
  name: string;
  seriesName: string;
  seasonName: string;
  leagueName: string;
  gameTime: string;
  location: string;
  buyIn: number;
  prizePool: number;
  totalPlayers: number;
  results: PlayerResultDto[];
}

export interface SaveGameResultsDto {
  seriesId: string;
  totalPlayers: number;
  gameTime: string;
  gameType: GameType;
  rankings: {
    id: string;
    name: string;
    position: number;
    isNew?: boolean;
  }[];
  bounties: {
    id: string;
    name: string;
    bountyCount?: number;
  }[];
  consolation: {
    id: string;
    name: string;
  }[];
  temporaryPlayers: {
    id: string;
    name: string;
  }[];
  userId: string;
}

export interface UpdateTournamentResultDto {
  id: string;
  name: string;
  gameTime: string;
  location: string;
  buyIn: number;
}

export interface IResultsFacade {
  /**
   * Save game results
   */
  saveGameResults(data: SaveGameResultsDto): Promise<{ 
    success: boolean; 
    data?: any; 
    error?: string;
    message?: string;
  }>;

  /**
   * Get all tournament results
   */
  getTournamentResults(): Promise<{ 
    success: boolean; 
    data?: TournamentResultDto[]; 
    error?: string 
  }>;

  /**
   * Get tournament result details
   */
  getTournamentResultDetails(id: string): Promise<{ 
    success: boolean; 
    data?: TournamentResultDetailsDto; 
    error?: string 
  }>;

  /**
   * Update tournament result
   */
  updateTournamentResult(data: UpdateTournamentResultDto): Promise<{ 
    success: boolean; 
    data?: any; 
    error?: string 
  }>;

  /**
   * Delete tournament result
   */
  deleteTournamentResult(id: string, userId: string): Promise<{ 
    success: boolean; 
    error?: string 
  }>;
}
