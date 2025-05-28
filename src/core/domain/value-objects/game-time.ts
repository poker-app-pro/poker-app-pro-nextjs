/**
 * GameTime Value Object
 * Represents the date and time when a tournament takes place
 */
export class GameTime {
  private readonly _value: Date;

  constructor(value: Date | string) {
    const date = value instanceof Date ? value : new Date(value);
    
    if (isNaN(date.getTime())) {
      throw new Error('GameTime must be a valid date');
    }
    
    this._value = new Date(date.getTime()); // Create a copy to ensure immutability
  }

  get value(): Date {
    return new Date(this._value.getTime()); // Return a copy to maintain immutability
  }

  /**
   * Check if the game time is in the past
   */
  isInPast(): boolean {
    return this._value < new Date();
  }

  /**
   * Check if the game time is in the future
   */
  isInFuture(): boolean {
    return this._value > new Date();
  }

  /**
   * Check if the game time is today
   */
  isToday(): boolean {
    const today = new Date();
    return this._value.toDateString() === today.toDateString();
  }

  /**
   * Get the date part as ISO string (YYYY-MM-DD)
   */
  toDateString(): string {
    return this._value.toISOString().split('T')[0];
  }

  /**
   * Get the full ISO string
   */
  toISOString(): string {
    return this._value.toISOString();
  }

  /**
   * Compare game times
   */
  isBefore(other: GameTime): boolean {
    return this._value < other._value;
  }

  isAfter(other: GameTime): boolean {
    return this._value > other._value;
  }

  equals(other: GameTime): boolean {
    return this._value.getTime() === other._value.getTime();
  }

  /**
   * Get a human-readable format
   */
  toDisplayString(): string {
    return this._value.toLocaleString();
  }

  toString(): string {
    return this._value.toISOString();
  }

  /**
   * Create GameTime for now
   */
  static now(): GameTime {
    return new GameTime(new Date());
  }

  /**
   * Create GameTime from ISO string
   */
  static fromISOString(isoString: string): GameTime {
    return new GameTime(isoString);
  }
}
