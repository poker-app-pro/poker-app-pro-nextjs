import type { Schema } from '@/amplify/data/resource';
import { GameResult } from '@/src/core/domain/entities/game-result';
import { Player } from '@/src/core/domain/entities/player';
import { Position } from '@/src/core/domain/value-objects/position';
import { Points } from '@/src/core/domain/value-objects/points';
import { GameTime } from '@/src/core/domain/value-objects/game-time';
import {
  IGameResultRepository,
  GameResultSearchCriteria,
  GameResultSearchResult,
  PlayerStats
} from '@/src/core/domain/repositories/game-result.repository';
import { generateClient } from 'aws-amplify/data';

/**
 * Amplify implementation of the Game Result Repository
 * Handles all game result data operations using AWS Amplify
 */
export class AmplifyGameResultRepository implements IGameResultRepository {
  private client = generateClient<Schema>();

  /**
   * Save a game result (create or update)
   */
  async save(gameResult: GameResult): Promise<GameResult> {
    try {
      // Check if game result exists
      const existing = await this.findById(gameResult.id);
      
      if (existing) {
        // Update existing game result
        const result = await this.client.models.TournamentPlayer.update({
          id: gameResult.id,
          tournamentId: gameResult.tournamentId,
          playerId: gameResult.player.id,
          finalPosition: gameResult.position.value,
          points: gameResult.points.value,
          bountyPoints: gameResult.bountyCount,
          consolationPoints: gameResult.isConsolation ? gameResult.points.value : 0,
          notes: gameResult.notes || null,
        });

        if (!result.data) {
          throw new Error('Failed to update game result');
        }

        return this.mapToGameResult(result.data);
      } else {
        // Create new game result
        const result = await this.client.models.TournamentPlayer.create({
          tournamentId: gameResult.tournamentId,
          playerId: gameResult.player.id,
          finalPosition: gameResult.position.value,
          points: gameResult.points.value,
          bountyPoints: gameResult.bountyCount,
          consolationPoints: gameResult.isConsolation ? gameResult.points.value : 0,
          notes: gameResult.notes || null,
        });

        if (!result.data) {
          throw new Error('Failed to create game result');
        }

        return this.mapToGameResult(result.data);
      }
    } catch (error) {
      throw new Error(`Failed to save game result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find game result by ID
   */
  async findById(id: string): Promise<GameResult | null> {
    try {
      const result = await this.client.models.TournamentPlayer.get({ id });
      
      if (!result.data) {
        return null;
      }

      return this.mapToGameResult(result.data);
    } catch (error) {
      throw new Error(`Failed to find game result by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find game results by criteria
   */
  async findMany(criteria: GameResultSearchCriteria): Promise<GameResultSearchResult> {
    try {
      const filter: any = {};

      // Build filter based on criteria
      if (criteria.tournamentId) {
        filter.tournamentId = { eq: criteria.tournamentId };
      }
      if (criteria.playerId) {
        filter.playerId = { eq: criteria.playerId };
      }
      if (criteria.minPosition) {
        filter.position = { ge: criteria.minPosition };
      }
      if (criteria.maxPosition) {
        filter.position = { le: criteria.maxPosition };
      }
      if (criteria.minPoints) {
        filter.points = { ge: criteria.minPoints };
      }
      if (criteria.isConsolation !== undefined) {
        filter.isConsolation = { eq: criteria.isConsolation };
      }

      const pageSize = criteria.pageSize || 20;
      const page = criteria.page || 1;
      
      const result = await this.client.models.TournamentPlayer.list({
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        limit: pageSize,
        // Note: Amplify pagination works differently, this is a simplified implementation
      });

      const gameResults = result.data?.map((data: any) => this.mapToGameResult(data)) || [];
      
      // Apply client-side filtering for date ranges if needed
      let filteredResults = gameResults;
      if (criteria.gameTimeAfter) {
        const afterDate = new GameTime(criteria.gameTimeAfter);
        filteredResults = filteredResults.filter((gr: GameResult) => gr.gameTime.isAfter(afterDate) || gr.gameTime.equals(afterDate));
      }
      if (criteria.gameTimeBefore) {
        const beforeDate = new GameTime(criteria.gameTimeBefore);
        filteredResults = filteredResults.filter((gr: GameResult) => gr.gameTime.isBefore(beforeDate) || gr.gameTime.equals(beforeDate));
      }

      // Apply sorting
      if (criteria.sortBy) {
        filteredResults.sort((a: GameResult, b: GameResult) => {
          let comparison = 0;
          if (criteria.sortBy === 'gameTime') {
            comparison = a.gameTime.isBefore(b.gameTime) ? -1 : a.gameTime.isAfter(b.gameTime) ? 1 : 0;
          } else if (criteria.sortBy === 'position') {
            comparison = a.position.value - b.position.value;
          } else if (criteria.sortBy === 'points' || criteria.sortBy === 'totalPoints') {
            comparison = a.points.value - b.points.value;
          }
          return criteria.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      const total = filteredResults.length;
      const totalPages = Math.ceil(total / pageSize);
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const paginatedResults = filteredResults.slice(startIndex, startIndex + pageSize);

      return {
        results: paginatedResults,
        total,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      throw new Error(`Failed to find game results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find all results for a specific tournament
   */
  async findByTournamentId(tournamentId: string): Promise<GameResult[]> {
    try {
      const result = await this.client.models.TournamentPlayer.list({
        filter: { tournamentId: { eq: tournamentId } }
      });

      return result.data?.map((data: any) => this.mapToGameResult(data)) || [];
    } catch (error) {
      throw new Error(`Failed to find game results by tournament ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find game results by player ID
   */
  async findByPlayerId(playerId: string): Promise<GameResult[]> {
    try {
      const result = await this.client.models.TournamentPlayer.list({
        filter: { playerId: { eq: playerId } }
      });

      return result.data?.map((data: any) => this.mapToGameResult(data)) || [];
    } catch (error) {
      throw new Error(`Failed to find game results by player ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find results by player and tournament
   */
  async findByPlayerAndTournament(playerId: string, tournamentId: string): Promise<GameResult[]> {
    try {
      const result = await this.client.models.TournamentPlayer.list({
        filter: { 
          and: [
            { playerId: { eq: playerId } },
            { tournamentId: { eq: tournamentId } }
          ]
        }
      });

      return result.data?.map((data: any) => this.mapToGameResult(data)) || [];
    } catch (error) {
      throw new Error(`Failed to find game results by player and tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a game result exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const gameResult = await this.findById(id);
      return gameResult !== null;
    } catch {
      return false;
    }
  }

  /**
   * Delete a game result by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const result = await this.client.models.TournamentPlayer.delete({ id });
      
      if (!result.data) {
        throw new Error('Failed to delete game result');
      }
    } catch (error) {
      throw new Error(`Failed to delete game result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Count total game results
   */
  async count(criteria?: Partial<GameResultSearchCriteria>): Promise<number> {
    try {
      const filter: any = {};

      if (criteria?.tournamentId) {
        filter.tournamentId = { eq: criteria.tournamentId };
      }
      if (criteria?.playerId) {
        filter.playerId = { eq: criteria.playerId };
      }
      if (criteria?.minPosition) {
        filter.position = { ge: criteria.minPosition };
      }
      if (criteria?.maxPosition) {
        filter.position = { le: criteria.maxPosition };
      }

      const result = await this.client.models.TournamentPlayer.list({
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      });

      return result.data?.length || 0;
    } catch (error) {
      throw new Error(`Failed to count game results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get leaderboard for a tournament
   */
  async getLeaderboard(tournamentId: string): Promise<GameResult[]> {
    try {
      const results = await this.findByTournamentId(tournamentId);
      
      // Sort by position (ascending - 1st place first)
      return results.sort((a, b) => a.position.value - b.position.value);
    } catch (error) {
      throw new Error(`Failed to get leaderboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get player statistics
   */
  async getPlayerStats(playerId: string): Promise<PlayerStats> {
    try {
      const results = await this.findByPlayerId(playerId);
      
      if (results.length === 0) {
        return {
          playerId,
          totalTournaments: 0,
          totalPoints: 0,
          averagePosition: 0,
          bestPosition: 0,
          worstPosition: 0,
          wins: 0,
          topThreeFinishes: 0,
          pointsEarned: 0,
          totalBounties: 0,
          consolationTournaments: 0,
        };
      }

      const totalTournaments = results.length;
      const totalPoints = results.reduce((sum, result) => sum + result.points.value, 0);
      const averagePosition = results.reduce((sum, result) => sum + result.position.value, 0) / totalTournaments;
      const bestPosition = Math.min(...results.map(result => result.position.value));
      const worstPosition = Math.max(...results.map(result => result.position.value));
      const wins = results.filter(result => result.isWinner()).length;
      const topThreeFinishes = results.filter(result => result.isTopThree()).length;
      const pointsEarned = results.filter(result => result.earnedPoints()).length;
      const totalBounties = results.reduce((sum, result) => sum + result.bountyCount, 0);
      const consolationTournaments = results.filter(result => result.isConsolation).length;

      return {
        playerId,
        totalTournaments,
        totalPoints,
        averagePosition,
        bestPosition,
        worstPosition,
        wins,
        topThreeFinishes,
        pointsEarned,
        totalBounties,
        consolationTournaments,
      };
    } catch (error) {
      throw new Error(`Failed to get player stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map Amplify data to GameResult domain entity
   */
  private mapToGameResult(data: any): GameResult {
    // Create a simple player object - in a real implementation, you might want to fetch full player data
    const player = new Player(
      data.playerId,
      data.playerName || 'Unknown Player', // You might need to join with Player table
      new GameTime(new Date()), // Default join date
      {
        isActive: true
      }
    );

    const position = new Position(data.position);
    const points = new Points(data.points);
    const gameTime = new GameTime(new Date(data.gameTime));

    return new GameResult(
      data.id,
      data.tournamentId,
      player,
      position,
      points,
      gameTime,
      {
        bountyCount: data.bountyCount || 0,
        isConsolation: data.isConsolation || false,
        notes: data.notes || undefined,
      }
    );
  }
}
