// Core domain entity for League
export interface LeagueEntity {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly isActive: boolean;
  readonly imageUrl?: string;
  readonly userId: string;
  readonly seasons: string[];
  readonly series: string[];
  readonly tournaments: string[];
  readonly scoreboards: string[];
  readonly qualifications: string[];
  readonly leagueSettings: string[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface CreateLeagueRequest {
  readonly name: string;
  readonly description?: string;
  readonly isActive?: boolean;
  readonly imageUrl?: string;
  readonly userId: string;
}

export interface UpdateLeagueRequest {
  readonly id: string;
  readonly name?: string;
  readonly description?: string;
  readonly isActive?: boolean;
  readonly imageUrl?: string;
}

// Domain events
export interface LeagueCreatedEvent {
  readonly type: 'LeagueCreated';
  readonly leagueId: string;
  readonly userId: string;
  readonly name: string;
  readonly timestamp: Date;
}

export interface LeagueUpdatedEvent {
  readonly type: 'LeagueUpdated';
  readonly leagueId: string;
  readonly userId: string;
  readonly changes: Partial<UpdateLeagueRequest>;
  readonly timestamp: Date;
}

export interface LeagueDeletedEvent {
  readonly type: 'LeagueDeleted';
  readonly leagueId: string;
  readonly userId: string;
  readonly timestamp: Date;
}

export type LeagueDomainEvent = LeagueCreatedEvent | LeagueUpdatedEvent | LeagueDeletedEvent;
