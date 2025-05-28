/**
 * Position Value Object
 * Represents a player's finishing position in a tournament
 */
export class Position {
  private readonly _value: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error('Position must be a positive integer');
    }
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  /**
   * Check if this position qualifies for points (top 10)
   */
  qualifiesForPoints(): boolean {
    return this._value <= 10;
  }

  /**
   * Check if this position is a winning position
   */
  isWinner(): boolean {
    return this._value === 1;
  }

  /**
   * Check if this position is in the top three
   */
  isTopThree(): boolean {
    return this._value <= 3;
  }

  /**
   * Compare positions
   */
  isBetterThan(other: Position): boolean {
    return this._value < other._value;
  }

  equals(other: Position): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
