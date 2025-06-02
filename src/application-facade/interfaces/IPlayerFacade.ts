import { 
  CreatePlayerDto, 
  UpdatePlayerDto, 
  PlayerResponseDto, 
  PlayerListDto, 
  PlayerSearchDto
} from '@/src/core/application/dtos/player.dto';

// Define PlayerProfileDto since it doesn't exist in the player.dto.ts file
export interface PlayerProfileDto {
  player: PlayerResponseDto;
  stats: {
    totalTournaments: number;
    totalWins: number;
    totalPoints: number;
    bestFinish: number;
    regularPoints: number;
    bountyPoints: number;
    consolationPoints: number;
    bountyCount: number;
    consolationCount: number;
  };
  tournamentResults: {
    id: string;
    tournamentId: string;
    tournamentName: string;
    seriesId: string;
    seriesName: string;
    seasonId: string;
    seasonName: string;
    date: string;
    finalPosition: number;
    points: number;
    bountyPoints: number;
    consolationPoints: number;
    totalPoints: number;
    bountyCount: number;
    isConsolation: boolean;
  }[];
  seriesScoreboards: {
    id: string;
    seriesId: string;
    seriesName: string;
    seasonId: string;
    seasonName: string;
    tournamentCount: number;
    bestFinish: number;
    totalPoints: number;
    regularPoints: number;
    bountyPoints: number;
    consolationPoints: number;
    bountyCount: number;
    consolationCount: number;
  }[];
  qualifications: {
    id: string;
    seasonEventName: string;
    chipCount: number;
    qualified: boolean;
    finalPosition: number | null;
  }[];
}

/**
 * Player Facade Interface
 * Framework-agnostic interface for player operations
 */
export interface IPlayerFacade {
  /**
   * Create a new player
   */
  createPlayer(data: CreatePlayerDto): Promise<{ success: boolean; data?: PlayerResponseDto; error?: string }>;

  /**
   * Update an existing player
   */
  updatePlayer(data: UpdatePlayerDto): Promise<{ success: boolean; data?: PlayerResponseDto; error?: string }>;

  /**
   * Delete a player
   */
  deletePlayer(id: string, userId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get a player by ID
   */
  getPlayer(id: string): Promise<{ success: boolean; data?: PlayerResponseDto; error?: string }>;

  /**
   * Get all players
   */
  getAllPlayers(search?: PlayerSearchDto): Promise<{ success: boolean; data?: PlayerListDto; error?: string }>;

  /**
   * Get player profile with detailed statistics
   */
  getPlayerProfile(id: string): Promise<{ success: boolean; data?: PlayerProfileDto; error?: string }>;

  /**
   * Search players by name
   */
  searchPlayers(searchTerm: string): Promise<{ success: boolean; data?: PlayerResponseDto[]; error?: string }>;

  /**
   * Check if player exists
   */
  playerExists(id: string): Promise<{ success: boolean; exists?: boolean; error?: string }>;
}
