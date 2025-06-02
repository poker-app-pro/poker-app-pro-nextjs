/**
 * Qualification Facade Interface
 * Framework-agnostic interface for qualification operations
 */

export interface QualifiedPlayerDto {
  id: string;
  name: string;
  tournamentCount: number;
  totalChips: number;
  qualificationType?: string;
}

export interface QualificationStatusDto {
  totalQualified: number;
  maxPlayers: number;
  tournamentWinners: number;
  topQualifiers: number;
  remainingSpots: number;
}

export interface SeasonEventDto {
  id: string;
  name: string;
  date: string;
  playerCount: number;
  results: SeasonEventResultDto[];
}

export interface SeasonEventResultDto {
  position: number;
  playerId: string;
  playerName: string;
  startingChips: number;
  prize: number;
}

export interface RecordSeasonEventDto {
  seasonId: string;
  eventName: string;
  eventDate: string;
  results: {
    playerId: string;
    position: number;
    prize: number;
  }[];
  userId: string;
}

export interface IQualificationFacade {
  /**
   * Get qualified players for a season
   */
  getQualifiedPlayers(seasonId: string, searchQuery?: string): Promise<{ 
    success: boolean; 
    data?: QualifiedPlayerDto[]; 
    error?: string 
  }>;

  /**
   * Get qualification status for a season
   */
  getQualificationStatus(seasonId: string): Promise<{ 
    success: boolean; 
    data?: QualificationStatusDto; 
    error?: string 
  }>;

  /**
   * Get previous season events
   */
  getPreviousSeasonEvents(seasonId: string): Promise<{ 
    success: boolean; 
    data?: SeasonEventDto[]; 
    error?: string 
  }>;

  /**
   * Record season event results
   */
  recordSeasonEvent(data: RecordSeasonEventDto): Promise<{ 
    success: boolean; 
    data?: any; 
    error?: string 
  }>;
}
