import { GameTime } from '@/src/core/domain/value-objects/game-time';

/**
 * League Entity
 * Represents a poker league in the system
 */
export class League {
  private readonly _id: string;
  private _name: string;
  private _description?: string;
  private _isActive: boolean;
  private _createdAt: GameTime;
  private _updatedAt: GameTime;
  private _ownerId: string;

  constructor(
    id: string,
    name: string,
    ownerId: string,
    createdAt: GameTime,
    options: {
      description?: string;
      isActive?: boolean;
      updatedAt?: GameTime;
    } = {}
  ) {
    if (!id.trim()) {
      throw new Error('League ID cannot be empty');
    }
    if (!name.trim()) {
      throw new Error('League name cannot be empty');
    }
    if (!ownerId.trim()) {
      throw new Error('League owner ID cannot be empty');
    }

    this._id = id;
    this._name = name.trim();
    this._ownerId = ownerId;
    this._createdAt = createdAt;
    this._description = options.description?.trim();
    this._isActive = options.isActive ?? true;
    this._updatedAt = options.updatedAt || createdAt;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): GameTime {
    return this._createdAt;
  }

  get updatedAt(): GameTime {
    return this._updatedAt;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  // Business methods
  updateName(newName: string): void {
    if (!newName.trim()) {
      throw new Error('League name cannot be empty');
    }
    this._name = newName.trim();
    this._updatedAt = GameTime.now();
  }

  updateDescription(newDescription?: string): void {
    this._description = newDescription?.trim();
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
   * Check if the user is the owner of this league
   */
  isOwnedBy(userId: string): boolean {
    return this._ownerId === userId;
  }

  /**
   * Transfer ownership to another user
   */
  transferOwnership(newOwnerId: string): void {
    if (!newOwnerId.trim()) {
      throw new Error('New owner ID cannot be empty');
    }
    this._ownerId = newOwnerId;
    this._updatedAt = GameTime.now();
  }

  equals(other: League): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `League(${this._id}, ${this._name})`;
  }

  /**
   * Create a new league
   */
  static create(
    id: string,
    name: string,
    ownerId: string,
    options: {
      description?: string;
      isActive?: boolean;
      createdAt?: GameTime;
    } = {}
  ): League {
    const createdAt = options.createdAt || GameTime.now();
    
    return new League(id, name, ownerId, createdAt, {
      description: options.description,
      isActive: options.isActive,
    });
  }
}
