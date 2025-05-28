/**
 * Data Transfer Objects for Player operations
 */

export interface CreatePlayerDto {
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly profileImageUrl?: string;
  readonly notes?: string;
}

export interface UpdatePlayerDto {
  readonly id: string;
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly profileImageUrl?: string;
  readonly notes?: string;
  readonly isActive?: boolean;
}

export interface PlayerResponseDto {
  readonly id: string;
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly profileImageUrl?: string;
  readonly notes?: string;
  readonly isActive: boolean;
  readonly joinDate: string; // ISO string
}

export interface PlayerListDto {
  readonly players: PlayerResponseDto[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface PlayerSearchDto {
  readonly query?: string;
  readonly isActive?: boolean;
  readonly joinedAfter?: string; // ISO string
  readonly joinedBefore?: string; // ISO string
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortBy?: 'name' | 'joinDate';
  readonly sortOrder?: 'asc' | 'desc';
}
