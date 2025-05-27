// Core domain entity for Player
export interface PlayerEntity {
  readonly id: string;
  readonly name: string;
  readonly email?: string;
  readonly userId: string;
  readonly phone?: string;
  readonly joinDate?: Date;
  readonly isActive: boolean;
  readonly profileImageUrl?: string;
  readonly tournamentPlayers: string[];
  readonly scoreboards: string[];
  readonly qualifications: string[];
  readonly preferredGameTypes: string[];
  readonly notes?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface CreatePlayerRequest {
  readonly name: string;
  readonly email?: string;
  readonly userId: string;
  readonly phone?: string;
  readonly joinDate?: Date;
  readonly isActive?: boolean;
  readonly profileImageUrl?: string;
  readonly preferredGameTypes?: string[];
  readonly notes?: string;
}

export interface UpdatePlayerRequest {
  readonly id: string;
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly isActive?: boolean;
  readonly profileImageUrl?: string;
  readonly preferredGameTypes?: string[];
  readonly notes?: string;
}

// Domain events
export interface PlayerCreatedEvent {
  readonly type: 'PlayerCreated';
  readonly playerId: string;
  readonly userId: string;
  readonly name: string;
  readonly timestamp: Date;
}

export interface PlayerUpdatedEvent {
  readonly type: 'PlayerUpdated';
  readonly playerId: string;
  readonly userId: string;
  readonly changes: Partial<UpdatePlayerRequest>;
  readonly timestamp: Date;
}

export interface PlayerDeletedEvent {
  readonly type: 'PlayerDeleted';
  readonly playerId: string;
  readonly userId: string;
  readonly timestamp: Date;
}

export type PlayerDomainEvent = PlayerCreatedEvent | PlayerUpdatedEvent | PlayerDeletedEvent;
