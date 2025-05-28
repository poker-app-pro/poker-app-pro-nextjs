import { GameTime } from '../value-objects/game-time';

/**
 * Tournament Entity
 * Represents a poker tournament within a series
 */
export class Tournament {
  private readonly _id: string;
  private _name: string;
  private _seriesId: string;
  private _seasonId: string;
  private _date: GameTime;
  private _isActive: boolean;
  private _notes?: string;
  private _maxPlayers?: number;
  private _buyIn?: number;
  private _createdAt: GameTime;
  private _updatedAt: GameTime;

  constructor(
    id: string,
    name: string,
    seriesId: string,
    seasonId: string,
    date: GameTime,
    createdAt: GameTime,
    options: {
      isActive?: boolean;
      notes?: string;
      maxPlayers?: number;
      buyIn?: number;
      updatedAt?: GameTime;
    } = {}
  ) {
    if (!id.trim()) {
      throw new Error('Tournament ID cannot be empty');
    }
    if (!name.trim()) {
      throw new Error('Tournament name cannot be empty');
    }
    if (!seriesId.trim()) {
      throw new Error('Series ID cannot be empty');
    }
    if (!seasonId.trim()) {
      throw new Error('Season ID cannot be empty');
    }
    if (options.maxPlayers !== undefined && options.maxPlayers <= 0) {
      throw new Error('Max players must be greater than 0');
    }
    if (options.buyIn !== undefined && options.buyIn < 0) {
      throw new Error('Buy-in cannot be negative');
    }

    this._id = id;
    this._name = name.trim();
    this._seriesId = seriesId;
    this._seasonId = seasonId;
    this._date = date;
    this._createdAt = createdAt;
    this._isActive = options.isActive ?? true;
    this._notes = options.notes?.trim();
    this._maxPlayers = options.maxPlayers;
    this._buyIn = options.buyIn;
    this._updatedAt = options.updatedAt || createdAt;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get seriesId(): string {
    return this._seriesId;
  }

  get seasonId(): string {
    return this._seasonId;
  }

  get date(): GameTime {
    return this._date;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get maxPlayers(): number | undefined {
    return this._maxPlayers;
  }

  get buyIn(): number | undefined {
    return this._buyIn;
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
      throw new Error('Tournament name cannot be empty');
    }
    this._name = newName.trim();
    this._updatedAt = GameTime.now();
  }

  updateDate(newDate: GameTime): void {
    this._date = newDate;
    this._updatedAt = GameTime.now();
  }

  updateNotes(newNotes?: string): void {
    this._notes = newNotes?.trim();
    this._updatedAt = GameTime.now();
  }

  updateMaxPlayers(maxPlayers?: number): void {
    if (maxPlayers !== undefined && maxPlayers <= 0) {
      throw new Error('Max players must be greater than 0');
    }
    this._maxPlayers = maxPlayers;
    this._updatedAt = GameTime.now();
  }

  updateBuyIn(buyIn?: number): void {
    if (buyIn !== undefined && buyIn < 0) {
      throw new Error('Buy-in cannot be negative');
    }
    this._buyIn = buyIn;
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
   * Check if the tournament has already taken place
   */
  hasCompleted(): boolean {
    return this._date.isInPast();
  }

  /**
   * Check if the tournament is scheduled for today
   */
  isToday(): boolean {
    return this._date.isToday();
  }

  /**
   * Check if the tournament is upcoming
   */
  isUpcoming(): boolean {
    return this._date.isInFuture();
  }

  /**
   * Check if the tournament can accept more players
   */
  canAcceptMorePlayers(currentPlayerCount: number): boolean {
    if (this._maxPlayers === undefined) {
      return true; // No limit set
    }
    return currentPlayerCount < this._maxPlayers;
  }

  /**
   * Check if the tournament is full
   */
  isFull(currentPlayerCount: number): boolean {
    return !this.canAcceptMorePlayers(currentPlayerCount);
  }

  /**
   * Get days until tournament
   */
  getDaysUntilTournament(): number {
    const now = GameTime.now();
    if (this._date.isBefore(now)) {
      return 0; // Tournament has passed
    }
    return now.daysBetween(this._date);
  }

  /**
   * Extract bounty players from notes
   */
  getBountyPlayers(): string[] {
    if (!this._notes || !this._notes.includes('Bounty players:')) {
      return [];
    }
    
    const bountySection = this._notes.split('Bounty players:')[1].split('\n')[0].trim();
    if (!bountySection) {
      return [];
    }
    
    return bountySection.split(', ').map(name => name.trim()).filter(name => name.length > 0);
  }

  /**
   * Extract consolation players from notes
   */
  getConsolationPlayers(): string[] {
    if (!this._notes || !this._notes.includes('Consolation players:')) {
      return [];
    }
    
    const consolationSection = this._notes.split('Consolation players:')[1].split('\n')[0].trim();
    if (!consolationSection) {
      return [];
    }
    
    return consolationSection.split(', ').map(name => name.trim()).filter(name => name.length > 0);
  }

  /**
   * Check if a player is a bounty player in this tournament
   */
  isBountyPlayer(playerName: string): boolean {
    return this.getBountyPlayers().includes(playerName);
  }

  /**
   * Check if a player is a consolation player in this tournament
   */
  isConsolationPlayer(playerName: string): boolean {
    return this.getConsolationPlayers().includes(playerName);
  }

  equals(other: Tournament): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `Tournament(${this._id}, ${this._name})`;
  }

  /**
   * Create a new tournament
   */
  static create(
    id: string,
    name: string,
    seriesId: string,
    seasonId: string,
    date: GameTime,
    options: {
      isActive?: boolean;
      notes?: string;
      maxPlayers?: number;
      buyIn?: number;
      createdAt?: GameTime;
    } = {}
  ): Tournament {
    const createdAt = options.createdAt || GameTime.now();
    
    return new Tournament(id, name, seriesId, seasonId, date, createdAt, {
      isActive: options.isActive,
      notes: options.notes,
      maxPlayers: options.maxPlayers,
      buyIn: options.buyIn,
    });
  }
}
