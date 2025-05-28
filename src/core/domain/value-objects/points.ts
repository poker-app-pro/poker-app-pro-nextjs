/**
 * Points Value Object
 * Represents points earned in a tournament
 */
export class Points {
  private readonly _value: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error('Points must be a non-negative integer');
    }
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  /**
   * Add points to current points
   */
  add(other: Points): Points {
    return new Points(this._value + other._value);
  }

  /**
   * Check if points are zero
   */
  isZero(): boolean {
    return this._value === 0;
  }

  /**
   * Check if points are positive
   */
  isPositive(): boolean {
    return this._value > 0;
  }

  /**
   * Compare points
   */
  isGreaterThan(other: Points): boolean {
    return this._value > other._value;
  }

  isLessThan(other: Points): boolean {
    return this._value < other._value;
  }

  equals(other: Points): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }

  /**
   * Create zero points
   */
  static zero(): Points {
    return new Points(0);
  }
}
