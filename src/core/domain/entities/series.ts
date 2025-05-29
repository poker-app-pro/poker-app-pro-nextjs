import { GameTime } from '@/src/core/domain/value-objects/game-time';

/**
 * Series Entity
 * Represents a tournament series within a season
 */
export class Series {
  private readonly _id: string;
  private _name: string;
  private _seasonId: string;
  private _startDate: GameTime;
  private _endDate: GameTime;
  private _isActive: boolean;
  private _description?: string;
  private _maxTournaments?: number;
  private _createdAt: GameTime;
  private _updatedAt: GameTime;

  constructor(
    id: string,
    name: string,
    seasonId: string,
    startDate: GameTime,
    endDate: GameTime,
    createdAt: GameTime,
    options: {
      isActive?: boolean;
      description?: string;
      maxTournaments?: number;
      updatedAt?: GameTime;
    } = {}
  ) {
    if (!id.trim()) {
      throw new Error('Series ID cannot be empty');
    }
    if (!name.trim()) {
      throw new Error('Series name cannot be empty');
    }
    if (!seasonId.trim()) {
      throw new Error('Season ID cannot be empty');
    }
    if (startDate.isAfter(endDate)) {
      throw new Error('Series start date cannot be after end date');
    }
    if (options.maxTournaments !== undefined && options.maxTournaments <= 0) {
      throw new Error('Max tournaments must be greater than 0');
    }

    this._id = id;
    this._name = name.trim();
    this._seasonId = seasonId;
    this._startDate = startDate;
    this._endDate = endDate;
    this._createdAt = createdAt;
    this._isActive = options.isActive ?? true;
    this._description = options.description?.trim();
    this._maxTournaments = options.maxTournaments;
    this._updatedAt = options.updatedAt || createdAt;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get seasonId(): string {
    return this._seasonId;
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

  get maxTournaments(): number | undefined {
    return this._maxTournaments;
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
      throw new Error('Series name cannot be empty');
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
      throw new Error('Series start date cannot be after end date');
    }
    this._startDate = startDate;
    this._endDate = endDate;
    this._updatedAt = GameTime.now();
  }

  updateMaxTournaments(maxTournaments?: number): void {
    if (maxTournaments !== undefined && maxTournaments <= 0) {
      throw new Error('Max tournaments must be greater than 0');
    }
    this._maxTournaments = maxTournaments;
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
   * Check if the series is currently running
   */
  isCurrentlyActive(): boolean {
    const now = GameTime.now();
    return this._isActive && 
           (this._startDate.isBefore(now) || this._startDate.equals(now)) &&
           (this._endDate.isAfter(now) || this._endDate.equals(now));
  }

  /**
   * Check if the series has started
   */
  hasStarted(): boolean {
    const now = GameTime.now();
    return this._startDate.isBefore(now) || this._startDate.equals(now);
  }

  /**
   * Check if the series has ended
   */
  hasEnded(): boolean {
    const now = GameTime.now();
    return this._endDate.isBefore(now);
  }

  /**
   * Get the duration of the series in days
   */
  getDurationInDays(): number {
    return this._startDate.daysBetween(this._endDate);
  }

  /**
   * Check if a date falls within the series
   */
  containsDate(date: GameTime): boolean {
    return (this._startDate.isBefore(date) || this._startDate.equals(date)) &&
           (this._endDate.isAfter(date) || this._endDate.equals(date));
  }

  /**
   * Check if the series can accept more tournaments
   */
  canAcceptMoreTournaments(currentTournamentCount: number): boolean {
    if (this._maxTournaments === undefined) {
      return true; // No limit set
    }
    return currentTournamentCount < this._maxTournaments;
  }

  /**
   * Check if the series has reached its tournament limit
   */
  hasReachedTournamentLimit(currentTournamentCount: number): boolean {
    return !this.canAcceptMoreTournaments(currentTournamentCount);
  }

  equals(other: Series): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `Series(${this._id}, ${this._name})`;
  }

  /**
   * Create a new series
   */
  static create(
    id: string,
    name: string,
    seasonId: string,
    startDate: GameTime,
    endDate: GameTime,
    options: {
      isActive?: boolean;
      description?: string;
      maxTournaments?: number;
      createdAt?: GameTime;
    } = {}
  ): Series {
    const createdAt = options.createdAt || GameTime.now();
    
    return new Series(id, name, seasonId, startDate, endDate, createdAt, {
      isActive: options.isActive,
      description: options.description,
      maxTournaments: options.maxTournaments,
    });
  }
}
