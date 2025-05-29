import { Qualification } from '@/src/core/domain/entities/qualification';

/**
 * Qualification Repository Interface
 * Defines the contract for qualification data persistence
 */
export interface IQualificationRepository {
  /**
   * Create a new qualification
   */
  create(qualification: Qualification): Promise<Qualification>;

  /**
   * Update an existing qualification
   */
  update(qualification: Qualification): Promise<Qualification>;

  /**
   * Delete a qualification by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find a qualification by ID
   */
  findById(id: string): Promise<Qualification | null>;

  /**
   * Find all qualifications
   */
  findAll(): Promise<Qualification[]>;

  /**
   * Find qualifications by player ID
   */
  findByPlayerId(playerId: string): Promise<Qualification[]>;

  /**
   * Find qualifications by season ID
   */
  findBySeasonId(seasonId: string): Promise<Qualification[]>;

  /**
   * Find qualifications by tournament ID
   */
  findByTournamentId(tournamentId: string): Promise<Qualification[]>;

  /**
   * Find active qualifications
   */
  findActive(): Promise<Qualification[]>;

  /**
   * Find qualified players for a season
   */
  findQualifiedBySeasonId(seasonId: string): Promise<Qualification[]>;

  /**
   * Find finale qualifications
   */
  findFinaleQualifications(): Promise<Qualification[]>;

  /**
   * Find special event qualifications
   */
  findSpecialEventQualifications(): Promise<Qualification[]>;

  /**
   * Find qualifications by type
   */
  findByQualificationType(qualificationType: string): Promise<Qualification[]>;

  /**
   * Check if a qualification exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check if a player is qualified for a season
   */
  isPlayerQualifiedForSeason(playerId: string, seasonId: string): Promise<boolean>;

  /**
   * Find player's qualification for a specific season
   */
  findPlayerQualificationForSeason(playerId: string, seasonId: string): Promise<Qualification | null>;

  /**
   * Count qualified players for a season
   */
  countQualifiedBySeasonId(seasonId: string): Promise<number>;
}
