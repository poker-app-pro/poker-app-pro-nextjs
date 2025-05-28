import { GameTime } from '../value-objects/game-time';

/**
 * Season Entity
 * Represents a poker season within a league
 */
export class Season {
  private readonly _id: string;
  private _name: string;
  private _leagueId: string;
  private _startDate: GameTime;
  private _endDate: GameTime;
  private _isActive: boolean;
  private _description?: string;
  private _createdAt: GameTime;
  private _updatedAt: GameTime;

  constructor(
    id: string,
    name: string,
    leagueId: string,
    startDate: GameTime,
    endDate: GameTime,
    createdAt: GameTime,
    options: {
      isActive?: boolean;
      description?: string;
      updatedAt?: GameTime;
    } = {}
  ) {
    if (!id.trim()) {
      throw new Error('Season ID cannot be empty');
    }
    if (!name.trim()) {
      throw new Error('Season name cannot be empty');
    }
    if (!leagueId.trim()) {
      throw new Error('League ID cannot be empty');
    }
    if (startDate.isAfter(endDate)) {
      throw new Error('Season start date cannot be after end date');
    }

    this._id = id;
    this._name = name.trim();
    this._leagueId = leagueId;
    this._startDate = startDate;
    this._endDate = endDate;
    this._createdAt = createdAt;
    this._isActive = options.isActive ?? true;
    this._description = options.description?.trim();
    this._updatedAt = options.updatedAt || createdAt;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get leagueId(): string {
    return this._leagueId;
  }

  get startDate(): GameTime {
    return this._startDate;
  }

  get endDate(): GameTime {
    return this._endDate;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get description(): string | undefined {
    return this._description;
  }

  get createdAt(): GameTime {
    return this._createdAt;
  }

  get updatedAt(): GameTime {
    return this._updatedAt;
  }

  // Business methods
  updateName(newName: string): void {
    if (!newName.trim()) {
      throw new Error('Season name cannot be empty');
    }
    this._name = newName.trim();
    this._updatedAt = GameTime.now();
  }

  updateDescription(newDescription?: string): void {
    this._description = newDescription?.trim();
    this._updatedAt = GameTime.now();
  }

  updateDates(startDate: GameTime, endDate: GameTime): void {
    if (startDate.isAfter(endDate)) {
      throw new Error('Season start date cannot be after end date');
    }
    this._startDate = startDate;
    this._endDate = endDate;
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
   * Check if the season is currently running
   */
  isCurrentlyActive(): boolean {
    const now = GameTime.now();
    return this._isActive && 
           (this._startDate.isBefore(now) || this._startDate.equals(now)) &&
           (this._endDate.isAfter(now) || this._endDate.equals(now));
  }

  /**
   * Check if the season has started
   */
  hasStarted(): boolean {
    const now = GameTime.now();
    return this._startDate.isBefore(now) || this._startDate.equals(now);
  }

  /**
   * Check if the season has ended
   */
  hasEnded(): boolean {
    const now = GameTime.now();
    return this._endDate.isBefore(now);
  }

  /**
   * Get the duration of the season in days
   */
  getDurationInDays(): number {
    return this._startDate.daysBetween(this._endDate);
  }

  /**
   * Check if a date falls within the season
   */
  containsDate(date: GameTime): boolean {
    return (this._startDate.isBefore(date) || this._startDate.equals(date)) &&
           (this._endDate.isAfter(date) || this._endDate.equals(date));
  }

  equals(other: Season): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `Season(${this._id}, ${this._name})`;
  }

  /**
   * Create a new season
   */
  static create(
    id: string,
    name: string,
    leagueId: string,
    startDate: GameTime,
    endDate: GameTime,
    options: {
      isActive?: boolean;
      description?: string;
      createdAt?: GameTime;
    } = {}
  ): Season {
    const createdAt = options.createdAt || GameTime.now();
    
    return new Season(id, name, leagueId, startDate, endDate, createdAt, {
      isActive: options.isActive,
      description: options.description,
    });
  }
}
