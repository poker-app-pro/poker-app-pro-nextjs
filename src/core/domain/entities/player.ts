import { GameTime } from '@/src/core/domain/value-objects/game-time';

/**
 * Player Entity
 * Represents a poker player in the system
 */
export class Player {
  private readonly _id: string;
  private _name: string;
  private _email?: string;
  private _phone?: string;
  private _joinDate: GameTime;
  private _isActive: boolean;
  private _profileImageUrl?: string;
  private _notes?: string;

  constructor(
    id: string,
    name: string,
    joinDate: GameTime,
    options: {
      email?: string;
      phone?: string;
      isActive?: boolean;
      profileImageUrl?: string;
      notes?: string;
    } = {}
  ) {
    if (!id.trim()) {
      throw new Error('Player ID cannot be empty');
    }
    if (!name.trim()) {
      throw new Error('Player name cannot be empty');
    }

    this._id = id;
    this._name = name.trim();
    this._joinDate = joinDate;
    this._email = options.email?.trim();
    this._phone = options.phone?.trim();
    this._isActive = options.isActive ?? true;
    this._profileImageUrl = options.profileImageUrl?.trim();
    this._notes = options.notes?.trim();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string | undefined {
    return this._email;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get joinDate(): GameTime {
    return this._joinDate;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get profileImageUrl(): string | undefined {
    return this._profileImageUrl;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  // Business methods
  updateName(newName: string): void {
    if (!newName.trim()) {
      throw new Error('Player name cannot be empty');
    }
    this._name = newName.trim();
  }

  updateEmail(newEmail?: string): void {
    this._email = newEmail?.trim();
  }

  updatePhone(newPhone?: string): void {
    this._phone = newPhone?.trim();
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  updateProfileImage(imageUrl?: string): void {
    this._profileImageUrl = imageUrl?.trim();
  }

  updateNotes(notes?: string): void {
    this._notes = notes?.trim();
  }

  /**
   * Check if player has been active for a certain period
   */
  hasBeenActiveSince(date: GameTime): boolean {
    return this._joinDate.isBefore(date) || this._joinDate.equals(date);
  }

  /**
   * Check if player is a new player (joined recently)
   */
  isNewPlayer(daysThreshold: number = 30): boolean {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
    const threshold = new GameTime(thresholdDate);
    
    return this._joinDate.isAfter(threshold);
  }

  equals(other: Player): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `Player(${this._id}, ${this._name})`;
  }

  /**
   * Create a new player
   */
  static create(
    id: string,
    name: string,
    options: {
      email?: string;
      phone?: string;
      isActive?: boolean;
      profileImageUrl?: string;
      notes?: string;
      joinDate?: GameTime;
    } = {}
  ): Player {
    const joinDate = options.joinDate || GameTime.now();
    
    return new Player(id, name, joinDate, {
      email: options.email,
      phone: options.phone,
      isActive: options.isActive,
      profileImageUrl: options.profileImageUrl,
      notes: options.notes,
    });
  }
}
