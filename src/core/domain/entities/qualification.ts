import { GameTime } from '@/src/core/domain/value-objects/game-time';

/**
 * Qualification Entity
 * Represents a player's qualification for a season finale or special event
 */
export class Qualification {
  private readonly _id: string;
  private _playerId: string;
  private _seasonId: string;
  private _tournamentId?: string;
  private _qualificationType: string;
  private _isActive: boolean;
  private _finalPosition?: number;
  private _createdAt: GameTime;
  private _updatedAt: GameTime;

  constructor(
    id: string,
    playerId: string,
    seasonId: string,
    qualificationType: string,
    createdAt: GameTime,
    options: {
      tournamentId?: string;
      isActive?: boolean;
      finalPosition?: number;
      updatedAt?: GameTime;
    } = {}
  ) {
    if (!id.trim()) {
      throw new Error('Qualification ID cannot be empty');
    }
    if (!playerId.trim()) {
      throw new Error('Player ID cannot be empty');
    }
    if (!seasonId.trim()) {
      throw new Error('Season ID cannot be empty');
    }
    if (!qualificationType.trim()) {
      throw new Error('Qualification type cannot be empty');
    }
    if (options.finalPosition !== undefined && options.finalPosition <= 0) {
      throw new Error('Final position must be greater than 0');
    }

    this._id = id;
    this._playerId = playerId;
    this._seasonId = seasonId;
    this._qualificationType = qualificationType.trim();
    this._createdAt = createdAt;
    this._tournamentId = options.tournamentId?.trim();
    this._isActive = options.isActive ?? true;
    this._finalPosition = options.finalPosition;
    this._updatedAt = options.updatedAt || createdAt;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get playerId(): string {
    return this._playerId;
  }

  get seasonId(): string {
    return this._seasonId;
  }

  get tournamentId(): string | undefined {
    return this._tournamentId;
  }

  get qualificationType(): string {
    return this._qualificationType;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get finalPosition(): number | undefined {
    return this._finalPosition;
  }

  get createdAt(): GameTime {
    return this._createdAt;
  }

  get updatedAt(): GameTime {
    return this._updatedAt;
  }

  // Business methods
  updateQualificationType(newType: string): void {
    if (!newType.trim()) {
      throw new Error('Qualification type cannot be empty');
    }
    this._qualificationType = newType.trim();
    this._updatedAt = GameTime.now();
  }

  setTournament(tournamentId: string): void {
    if (!tournamentId.trim()) {
      throw new Error('Tournament ID cannot be empty');
    }
    this._tournamentId = tournamentId.trim();
    this._updatedAt = GameTime.now();
  }

  removeTournament(): void {
    this._tournamentId = undefined;
    this._updatedAt = GameTime.now();
  }

  setFinalPosition(position: number): void {
    if (position <= 0) {
      throw new Error('Final position must be greater than 0');
    }
    this._finalPosition = position;
    this._updatedAt = GameTime.now();
  }

  removeFinalPosition(): void {
    this._finalPosition = undefined;
    this._updatedAt = GameTime.now();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = GameTime.now();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = GameTime.now();
  }

  /**
   * Check if the qualification is for a specific tournament
   */
  isForTournament(): boolean {
    return this._tournamentId !== undefined;
  }

  /**
   * Check if the player has completed the qualification event
   */
  hasCompleted(): boolean {
    return this._finalPosition !== undefined;
  }

  /**
   * Check if the player qualified (is active and has completed)
   */
  isQualified(): boolean {
    return this._isActive && this.hasCompleted();
  }

  /**
   * Check if this is a finale qualification
   */
  isFinaleQualification(): boolean {
    return this._qualificationType.toLowerCase().includes('finale');
  }

  /**
   * Check if this is a special event qualification
   */
  isSpecialEventQualification(): boolean {
    return !this.isFinaleQualification();
  }

  /**
   * Get qualification display name
   */
  getDisplayName(): string {
    return `${this._qualificationType} Qualification`;
  }

  equals(other: Qualification): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `Qualification(${this._id}, ${this._playerId}, ${this._qualificationType})`;
  }

  /**
   * Create a new qualification
   */
  static create(
    id: string,
    playerId: string,
    seasonId: string,
    qualificationType: string,
    options: {
      tournamentId?: string;
      isActive?: boolean;
      finalPosition?: number;
      createdAt?: GameTime;
    } = {}
  ): Qualification {
    const createdAt = options.createdAt || GameTime.now();
    
    return new Qualification(id, playerId, seasonId, qualificationType, createdAt, {
      tournamentId: options.tournamentId,
      isActive: options.isActive,
      finalPosition: options.finalPosition,
    });
  }

  /**
   * Create a finale qualification
   */
  static createFinaleQualification(
    id: string,
    playerId: string,
    seasonId: string,
    options: {
      tournamentId?: string;
      isActive?: boolean;
      finalPosition?: number;
      createdAt?: GameTime;
    } = {}
  ): Qualification {
    return Qualification.create(id, playerId, seasonId, 'Finale', options);
  }

  /**
   * Create a special event qualification
   */
  static createSpecialEventQualification(
    id: string,
    playerId: string,
    seasonId: string,
    eventName: string,
    options: {
      tournamentId?: string;
      isActive?: boolean;
      finalPosition?: number;
      createdAt?: GameTime;
    } = {}
  ): Qualification {
    return Qualification.create(id, playerId, seasonId, eventName, options);
  }
}
