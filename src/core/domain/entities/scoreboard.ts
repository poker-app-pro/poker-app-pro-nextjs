import { GameTime } from '@/src/core/domain/value-objects/game-time';
import { Points } from '@/src/core/domain/value-objects/points';

/**
 * Scoreboard Entity
 * Represents a player's accumulated points and statistics for a series
 */
export class Scoreboard {
  private readonly _id: string;
  private _playerId: string;
  private _seriesId: string;
  private _seasonId: string;
  private _tournamentCount: number;
  private _bestFinish: number;
  private _totalPoints: Points;
  private _createdAt: GameTime;
  private _updatedAt: GameTime;

  constructor(
    id: string,
    playerId: string,
    seriesId: string,
    seasonId: string,
    createdAt: GameTime,
    options: {
      tournamentCount?: number;
      bestFinish?: number;
      totalPoints?: Points;
      updatedAt?: GameTime;
    } = {}
  ) {
    if (!id.trim()) {
      throw new Error('Scoreboard ID cannot be empty');
    }
    if (!playerId.trim()) {
      throw new Error('Player ID cannot be empty');
    }
    if (!seriesId.trim()) {
      throw new Error('Series ID cannot be empty');
    }
    if (!seasonId.trim()) {
      throw new Error('Season ID cannot be empty');
    }
    if (options.tournamentCount !== undefined && options.tournamentCount < 0) {
      throw new Error('Tournament count cannot be negative');
    }
    if (options.bestFinish !== undefined && options.bestFinish < 0) {
      throw new Error('Best finish cannot be negative');
    }

    this._id = id;
    this._playerId = playerId;
    this._seriesId = seriesId;
    this._seasonId = seasonId;
    this._createdAt = createdAt;
    this._tournamentCount = options.tournamentCount || 0;
    this._bestFinish = options.bestFinish || 0;
    this._totalPoints = options.totalPoints || new Points(0);
    this._updatedAt = options.updatedAt || createdAt;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get playerId(): string {
    return this._playerId;
  }

  get seriesId(): string {
    return this._seriesId;
  }

  get seasonId(): string {
    return this._seasonId;
  }

  get tournamentCount(): number {
    return this._tournamentCount;
  }

  get bestFinish(): number {
    return this._bestFinish;
  }

  get totalPoints(): Points {
    return this._totalPoints;
  }

  get createdAt(): GameTime {
    return this._createdAt;
  }

  get updatedAt(): GameTime {
    return this._updatedAt;
  }

  // Business methods
  addTournamentResult(finalPosition: number, points: Points): void {
    if (finalPosition <= 0) {
      throw new Error('Final position must be greater than 0');
    }

    this._tournamentCount++;
    this._totalPoints = this._totalPoints.add(points);
    
    // Update best finish if this is better (lower position number)
    if (this._bestFinish === 0 || finalPosition < this._bestFinish) {
      this._bestFinish = finalPosition;
    }
    
    this._updatedAt = GameTime.now();
  }

  removeTournamentResult(finalPosition: number, points: Points): void {
    if (finalPosition <= 0) {
      throw new Error('Final position must be greater than 0');
    }
    if (this._tournamentCount <= 0) {
      throw new Error('Cannot remove tournament result: no tournaments recorded');
    }

    this._tournamentCount--;
    this._totalPoints = this._totalPoints.subtract(points);
    
    // Note: We can't automatically recalculate best finish when removing a result
    // This would require knowledge of all remaining tournament results
    // The calling code should handle this by recalculating the entire scoreboard
    
    this._updatedAt = GameTime.now();
  }

  updateBestFinish(bestFinish: number): void {
    if (bestFinish <= 0) {
      throw new Error('Best finish must be greater than 0');
    }
    this._bestFinish = bestFinish;
    this._updatedAt = GameTime.now();
  }

  resetBestFinish(): void {
    this._bestFinish = 0;
    this._updatedAt = GameTime.now();
  }

  /**
   * Recalculate scoreboard from scratch
   */
  recalculate(tournamentResults: Array<{ finalPosition: number; points: Points }>): void {
    this._tournamentCount = tournamentResults.length;
    
    if (tournamentResults.length === 0) {
      this._totalPoints = new Points(0);
      this._bestFinish = 0;
    } else {
      // Calculate total points
      this._totalPoints = tournamentResults.reduce(
        (total, result) => total.add(result.points),
        new Points(0)
      );
      
      // Calculate best finish
      this._bestFinish = Math.min(...tournamentResults.map(r => r.finalPosition));
    }
    
    this._updatedAt = GameTime.now();
  }

  /**
   * Get average points per tournament
   */
  getAveragePointsPerTournament(): number {
    if (this._tournamentCount === 0) {
      return 0;
    }
    return this._totalPoints.value / this._tournamentCount;
  }

  /**
   * Check if player has played any tournaments
   */
  hasPlayedTournaments(): boolean {
    return this._tournamentCount > 0;
  }

  /**
   * Check if player has won a tournament (1st place finish)
   */
  hasWonTournament(): boolean {
    return this._bestFinish === 1;
  }

  /**
   * Check if player has made a final table (top 8 finish)
   */
  hasMadeFinalTable(): boolean {
    return this._bestFinish > 0 && this._bestFinish <= 8;
  }

  /**
   * Get points per tournament ratio
   */
  getPointsEfficiency(): number {
    return this.getAveragePointsPerTournament();
  }

  /**
   * Compare scoreboards for ranking
   */
  compareForRanking(other: Scoreboard): number {
    // Primary: Total points (descending)
    const pointsDiff = other._totalPoints.value - this._totalPoints.value;
    if (pointsDiff !== 0) {
      return pointsDiff;
    }
    
    // Secondary: Best finish (ascending - lower is better)
    const bestFinishDiff = this._bestFinish - other._bestFinish;
    if (bestFinishDiff !== 0) {
      return bestFinishDiff;
    }
    
    // Tertiary: Tournament count (descending)
    return other._tournamentCount - this._tournamentCount;
  }

  equals(other: Scoreboard): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `Scoreboard(${this._id}, ${this._playerId}, ${this._totalPoints.value} pts)`;
  }

  /**
   * Create a new scoreboard
   */
  static create(
    id: string,
    playerId: string,
    seriesId: string,
    seasonId: string,
    options: {
      tournamentCount?: number;
      bestFinish?: number;
      totalPoints?: Points;
      createdAt?: GameTime;
    } = {}
  ): Scoreboard {
    const createdAt = options.createdAt || GameTime.now();
    
    return new Scoreboard(id, playerId, seriesId, seasonId, createdAt, {
      tournamentCount: options.tournamentCount,
      bestFinish: options.bestFinish,
      totalPoints: options.totalPoints,
    });
  }

  /**
   * Create an empty scoreboard for a new player
   */
  static createEmpty(
    id: string,
    playerId: string,
    seriesId: string,
    seasonId: string,
    createdAt?: GameTime
  ): Scoreboard {
    return Scoreboard.create(id, playerId, seriesId, seasonId, {
      tournamentCount: 0,
      bestFinish: 0,
      totalPoints: new Points(0),
      createdAt,
    });
  }
}
