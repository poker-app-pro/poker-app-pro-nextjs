/**
 * Data Transfer Objects for GameResult operations
 */

export interface CreateGameResultDto {
  readonly tournamentId: string;
  readonly playerId: string;
  readonly position: number;
  readonly points: number;
  readonly bountyCount?: number;
  readonly isConsolation?: boolean;
  readonly notes?: string;
  readonly gameTime?: string; // ISO string
}

export interface UpdateGameResultDto {
  readonly id: string;
  readonly bountyCount?: number;
  readonly isConsolation?: boolean;
  readonly notes?: string;
}

export interface GameResultResponseDto {
  readonly id: string;
  readonly tournamentId: string;
  readonly player: {
    readonly id: string;
    readonly name: string;
  };
  readonly position: number;
  readonly points: number;
  readonly bountyCount: number;
  readonly isConsolation: boolean;
  readonly notes?: string;
  readonly gameTime: string; // ISO string
  readonly totalPoints: number; // includes bounty points
}

export interface GameResultListDto {
  readonly results: GameResultResponseDto[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface GameResultSearchDto {
  readonly tournamentId?: string;
  readonly playerId?: string;
  readonly minPosition?: number;
  readonly maxPosition?: number;
  readonly minPoints?: number;
  readonly earnedPoints?: boolean; // filter for results that earned points
  readonly isConsolation?: boolean;
  readonly gameTimeAfter?: string; // ISO string
  readonly gameTimeBefore?: string; // ISO string
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortBy?: 'position' | 'points' | 'gameTime' | 'totalPoints';
  readonly sortOrder?: 'asc' | 'desc';
}

export interface CalculatePointsDto {
  readonly position: number;
  readonly totalPlayers: number;
  readonly strategyName: string;
  readonly bountyCount?: number;
  readonly bountyPointValue?: number;
}

export interface PointsCalculationResponseDto {
  readonly basePoints: number;
  readonly bountyPoints: number;
  readonly totalPoints: number;
  readonly strategyUsed: string;
}
