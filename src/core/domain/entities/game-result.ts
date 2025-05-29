import { Player } from '@/src/core/domain/entities/player';
import { Position } from '@/src/core/domain/value-objects/position';
import { Points } from '@/src/core/domain/value-objects/points';
import { GameTime } from '@/src/core/domain/value-objects/game-time';

/**
 * GameResult Entity
 * Represents a player's result in a specific tournament
 */
export class GameResult {
  private readonly _id: string;
  private readonly _tournamentId: string;
  private readonly _player: Player;
  private readonly _position: Position;
  private readonly _points: Points;
  private readonly _gameTime: GameTime;
  private _bountyCount: number;
  private _isConsolation: boolean;
  private _notes?: string;

  constructor(
    id: string,
    tournamentId: string,
    player: Player,
    position: Position,
    points: Points,
    gameTime: GameTime,
    options: {
      bountyCount?: number;
      isConsolation?: boolean;
      notes?: string;
    } = {}
  ) {
    if (!id.trim()) {
      throw new Error('GameResult ID cannot be empty');
    }
    if (!tournamentId.trim()) {
      throw new Error('Tournament ID cannot be empty');
    }

    this._id = id;
    this._tournamentId = tournamentId;
    this._player = player;
    this._position = position;
    this._points = points;
    this._gameTime = gameTime;
    this._bountyCount = options.bountyCount ?? 0;
    this._isConsolation = options.isConsolation ?? false;
    this._notes = options.notes?.trim();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get tournamentId(): string {
    return this._tournamentId;
  }

  get player(): Player {
    return this._player;
  }

  get position(): Position {
    return this._position;
  }

  get points(): Points {
    return this._points;
  }

  get gameTime(): GameTime {
    return this._gameTime;
  }

  get bountyCount(): number {
    return this._bountyCount;
  }

  get isConsolation(): boolean {
    return this._isConsolation;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  // Business methods
  addBounty(): void {
    this._bountyCount++;
  }

  removeBounty(): void {
    if (this._bountyCount > 0) {
      this._bountyCount--;
    }
  }

  setBountyCount(count: number): void {
    if (count < 0) {
      throw new Error('Bounty count cannot be negative');
    }
    this._bountyCount = count;
  }

  markAsConsolation(): void {
    this._isConsolation = true;
  }

  unmarkAsConsolation(): void {
    this._isConsolation = false;
  }

  updateNotes(notes?: string): void {
    this._notes = notes?.trim();
  }

  /**
   * Check if this result earned points
   */
  earnedPoints(): boolean {
    return this._points.isPositive();
  }

  /**
   * Check if this is a winning result
   */
  isWinner(): boolean {
    return this._position.isWinner();
  }

  /**
   * Check if this is a top three finish
   */
  isTopThree(): boolean {
    return this._position.isTopThree();
  }

  /**
   * Check if this result qualifies for points
   */
  qualifiesForPoints(): boolean {
    return this._position.qualifiesForPoints();
  }

  /**
   * Get total bonus points from bounties
   */
  getBountyPoints(bountyPointValue: number = 1): Points {
    return new Points(this._bountyCount * bountyPointValue);
  }

  /**
   * Get total points including bounties
   */
  getTotalPoints(bountyPointValue: number = 1): Points {
    return this._points.add(this.getBountyPoints(bountyPointValue));
  }

  /**
   * Check if result is better than another result
   */
  isBetterThan(other: GameResult): boolean {
    return this._position.isBetterThan(other._position);
  }

  equals(other: GameResult): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `GameResult(${this._player.name}, Position: ${this._position.value}, Points: ${this._points.value})`;
  }

  /**
   * Create a new game result
   */
  static create(
    id: string,
    tournamentId: string,
    player: Player,
    position: Position,
    points: Points,
    options: {
      gameTime?: GameTime;
      bountyCount?: number;
      isConsolation?: boolean;
      notes?: string;
    } = {}
  ): GameResult {
    const gameTime = options.gameTime || GameTime.now();
    
    return new GameResult(id, tournamentId, player, position, points, gameTime, {
      bountyCount: options.bountyCount,
      isConsolation: options.isConsolation,
      notes: options.notes,
    });
  }
}
