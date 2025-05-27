// Core domain entity for Tournament
export interface TournamentEntity {
  readonly id: string;
  readonly name: string;
  readonly seriesId: string;
  readonly seasonId: string;
  readonly leagueId: string;
  readonly userId: string;
  readonly date: string;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly location?: string;
  readonly gameType: string;
  readonly buyIn: number;
  readonly rebuyAllowed: boolean;
  readonly rebuyAmount: number;
  readonly rebuyChips?: number;
  readonly startingChips?: number;
  readonly blindStructure?: string;
  readonly status?: string;
  readonly maxPlayers?: number;
  readonly totalPlayers?: number;
  readonly notes?: string;
  readonly tournamentPlayers: string[];
  readonly qualifications: string[];
  readonly isFinalized: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface CreateTournamentRequest {
  readonly name: string;
  readonly seriesId: string;
  readonly seasonId: string;
  readonly leagueId: string;
  readonly userId: string;
  readonly date: string;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly location?: string;
  readonly gameType?: string;
  readonly buyIn?: number;
  readonly rebuyAllowed?: boolean;
  readonly rebuyAmount?: number;
  readonly rebuyChips?: number;
  readonly startingChips?: number;
  readonly blindStructure?: string;
  readonly maxPlayers?: number;
  readonly notes?: string;
}

export interface UpdateTournamentRequest {
  readonly id: string;
  readonly name?: string;
  readonly date?: string;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly location?: string;
  readonly gameType?: string;
  readonly buyIn?: number;
  readonly rebuyAllowed?: boolean;
  readonly rebuyAmount?: number;
  readonly rebuyChips?: number;
  readonly startingChips?: number;
  readonly blindStructure?: string;
  readonly status?: string;
  readonly maxPlayers?: number;
  readonly totalPlayers?: number;
  readonly notes?: string;
  readonly isFinalized?: boolean;
}

// Domain events
export interface TournamentCreatedEvent {
  readonly type: 'TournamentCreated';
  readonly tournamentId: string;
  readonly leagueId: string;
  readonly userId: string;
  readonly name: string;
  readonly timestamp: Date;
}

export interface TournamentUpdatedEvent {
  readonly type: 'TournamentUpdated';
  readonly tournamentId: string;
  readonly userId: string;
  readonly changes: Partial<UpdateTournamentRequest>;
  readonly timestamp: Date;
}

export interface TournamentFinalizedEvent {
  readonly type: 'TournamentFinalized';
  readonly tournamentId: string;
  readonly userId: string;
  readonly timestamp: Date;
}

export interface TournamentDeletedEvent {
  readonly type: 'TournamentDeleted';
  readonly tournamentId: string;
  readonly userId: string;
  readonly timestamp: Date;
}

export type TournamentDomainEvent = 
  | TournamentCreatedEvent 
  | TournamentUpdatedEvent 
  | TournamentFinalizedEvent 
  | TournamentDeletedEvent;
