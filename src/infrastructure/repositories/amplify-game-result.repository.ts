import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { GameResult } from '../../core/domain/entities/game-result';
import { Player } from '../../core/domain/entities/player';
import { Position } from '../../core/domain/value-objects/position';
import { Points } from '../../core/domain/value-objects/points';
import { GameTime } from '../../core/domain/value-objects/game-time';
import { 
  IGameResultRepository, 
  GameResultSearchCriteria, 
  GameResultSearchResult, 
  PlayerStats 
} from '../../core/domain/repositories/game-result.repository';

/**
 * Amplify implementation of Game Result Repository
 * Connects domain layer to AWS Amplify DataStore via TournamentPlayer model
 */
export class AmplifyGameResultRepository implements IGameResultRepository {
  private client = generateClient<Schema>();

  async save(gameResult: GameResult): Promise<GameResult> {
    try {
      // Check if game result exists (update vs create)
      const existingResult = await this.findById(gameResult.id);
      
      if (existingResult) {
        // Update existing game result
        const { data: updatedResult } = await this.client.models.TournamentPlayer.update({
          id: gameResult.id,
          tournamentId: gameResult.tournamentId,
          playerId: gameResult.player.id,
          finalPosition: gameResult.position.value,
          points: gameResult.points.value,
          bountyPoints: gameResult.bountyCount || 0,
          consolationPoints: gameResult.isConsolation ? gameResult.points.value : 0,
          notes: gameResult.notes || null,
          checkedIn: true,
          checkedInAt: gameResult.gameTime.toISOString(),
        });

        if (!updatedResult) {
          throw new Error('Failed to update game result');
        }

        return await this.toDomainEntity(updatedResult);
      } else {
        // Create new game result
        const { data: newResult } = await this.client.models.TournamentPlayer.create({
          id: gameResult.id,
          tournamentId: gameResult.tournamentId,
          playerId: gameResult.player.id,
          finalPosition: gameResult.position.value,
          points: gameResult.points.value,
          bountyPoints: gameResult.bountyCount || 0,
          consolationPoints: gameResult.isConsolation ? gameResult.points.value : 0,
          notes: gameResult.notes || null,
          checkedIn: true,
          checkedInAt: gameResult.gameTime.toISOString(),
          registrationDate: gameResult.gameTime.toISOString(),
        });

        if (!newResult) {
          throw new Error('Failed to create game result');
        }

        return await this.toDomainEntity(newResult);
      }
    } catch (error) {
      throw new Error(`Failed to save game result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<GameResult | null> {
    try {
      const { data: tournamentPlayer } = await this.client.models.TournamentPlayer.get({ id });
      
      if (!tournamentPlayer) {
        return null;
      }

      return await this.toDomainEntity(tournamentPlayer);
    } catch (error) {
      throw new Error(`Failed to find game result by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findMany(criteria: GameResultSearchCriteria): Promise<GameResultSearchResult> {
    try {
      // Build the query based on criteria
      let query = this.client.models.TournamentPlayer.list();

      // Apply filters
      const filters: any[] = [];
      
      if (criteria.tournamentId) {
        filters.push({ tournamentId: { eq: criteria.tournamentId } });
      }

      if (criteria.playerId) {
        filters.push({ playerId: { eq: criteria.playerId } });
      }

      if (criteria.minPosition) {
        filters.push({ finalPosition: { ge: criteria.minPosition } });
      }

      if (criteria.maxPosition) {
        filters.push({ finalPosition: { le: criteria.maxPosition } });
      }

      if (criteria.minPoints) {
        filters.push({ points: { ge: criteria.minPoints } });
      }

      if (criteria.earnedPoints !== undefined) {
        if (criteria.earnedPoints) {
          filters.push({ points: { gt: 0 } });
        } else {
          filters.push({ points: { eq: 0 } });
        }
      }

      if (criteria.isConsolation !== undefined) {
        if (criteria.isConsolation) {
          filters.push({ consolationPoints: { gt: 0 } });
        } else {
          filters.push({ consolationPoints: { eq: 0 } });
        }
      }

      // Apply filters if any exist
      if (filters.length > 0) {
        query = this.client.models.TournamentPlayer.list({
          filter: filters.length === 1 ? filters[0] : { and: filters }
        });
      }

      const { data: tournamentPlayers } = await query;

      if (!tournamentPlayers) {
        return {
          results: [],
          total: 0,
          page: criteria.page || 1,
          pageSize: criteria.pageSize || 20,
          totalPages: 0,
        };
      }

      // Convert to domain entities
      const gameResults = await Promise.all(
        tournamentPlayers.map(tp => this.toDomainEntity(tp))
      );

      // Apply sorting
      if (criteria.sortBy) {
        gameResults.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          switch (criteria.sortBy) {
            case 'position':
              aValue = a.position.value;
              bValue = b.position.value;
              break;
            case 'points':
              aValue = a.points.value;
              bValue = b.points.value;
              break;
            case 'gameTime':
              aValue = a.gameTime.value.getTime();
              bValue = b.gameTime.value.getTime();
              break;
            case 'totalPoints':
              aValue = a.getTotalPoints().value;
              bValue = b.getTotalPoints().value;
              break;
            default:
              aValue = a.position.value;
              bValue = b.position.value;
          }

          if (criteria.sortOrder === 'desc') {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
        });
      }

      // Apply pagination
      const page = criteria.page || 1;
      const pageSize = criteria.pageSize || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedResults = gameResults.slice(startIndex, endIndex);
      const totalPages = Math.ceil(gameResults.length / pageSize);

      return {
        results: paginatedResults,
        total: gameResults.length,
        page,
        pageSize,
        totalPages,
      };
    } catch {
      throw new Error('Failed to search game results');
    }
  }

  async findByTournamentId(tournamentId: string): Promise<GameResult[]> {
    try {
      const { data: tournamentPlayers } = await this.client.models.TournamentPlayer.list({
        filter: { tournamentId: { eq: tournamentId } }
      });

      if (!tournamentPlayers) {
        return [];
      }

      const gameResults = await Promise.all(
        tournamentPlayers.map(tp => this.toDomainEntity(tp))
      );

      return gameResults;
    } catch (error) {
      throw new Error(`Failed to find game results by tournament ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByPlayerId(playerId: string): Promise<GameResult[]> {
    try {
      const { data: tournamentPlayers } = await this.client.models.TournamentPlayer.list({
        filter: { playerId: { eq: playerId } }
      });

      if (!tournamentPlayers) {
        return [];
      }

      const gameResults = await Promise.all(
        tournamentPlayers.map(tp => this.toDomainEntity(tp))
      );

      return gameResults;
    } catch (error) {
      throw new Error(`Failed to find game results by player ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByPlayerAndTournament(playerId: string, tournamentId: string): Promise<GameResult[]> {
    try {
      const { data: tournamentPlayers } = await this.client.models.TournamentPlayer.list({
        filter: {
          and: [
            { playerId: { eq: playerId } },
            { tournamentId: { eq: tournamentId } }
          ]
        }
      });

      if (!tournamentPlayers) {
        return [];
      }

      const gameResults = await Promise.all(
        tournamentPlayers.map(tp => this.toDomainEntity(tp))
      );

      return gameResults;
    } catch (error) {
      throw new Error(`Failed to find game results by player and tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLeaderboard(tournamentId: string): Promise<GameResult[]> {
    try {
      const results = await this.findByTournamentId(tournamentId);
      
      // Sort by position (ascending - 1st place first)
      return results.sort((a, b) => a.position.value - b.position.value);
    } catch (error) {
      throw new Error(`Failed to get leaderboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

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

      const positions = results.map(r => r.position.value);
      const points = results.map(r => r.points.value);
      const totalBounties = results.reduce((sum, r) => sum + (r.bountyCount || 0), 0);
      const consolationTournaments = results.filter(r => r.isConsolation).length;
      const wins = results.filter(r => r.position.value === 1).length;
      const topThreeFinishes = results.filter(r => r.position.value <= 3).length;
      const pointsEarned = points.reduce((sum, p) => sum + p, 0);

      return {
        playerId,
        totalTournaments: results.length,
        totalPoints: results.reduce((sum, r) => sum + r.getTotalPoints().value, 0),
        averagePosition: positions.reduce((sum, p) => sum + p, 0) / positions.length,
        bestPosition: Math.min(...positions),
        worstPosition: Math.max(...positions),
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

  async exists(id: string): Promise<boolean> {
    try {
      const gameResult = await this.findById(id);
      return gameResult !== null;
    } catch {
      return false;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { data: deletedResult } = await this.client.models.TournamentPlayer.delete({ id });
      
      if (!deletedResult) {
        throw new Error('Game result not found or already deleted');
      }
    } catch (error) {
      throw new Error(`Failed to delete game result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(criteria?: Partial<GameResultSearchCriteria>): Promise<number> {
    try {
      if (!criteria || Object.keys(criteria).length === 0) {
        const { data: tournamentPlayers } = await this.client.models.TournamentPlayer.list();
        return tournamentPlayers?.length || 0;
      }

      // Use findMany with criteria and return total count
      const result = await this.findMany(criteria as GameResultSearchCriteria);
      return result.total;
    } catch (error) {
      throw new Error(`Failed to count game results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async toDomainEntity(tournamentPlayer: any): Promise<GameResult> {
    // Get the player entity
    const { data: playerData } = await this.client.models.Player.get({ 
      id: tournamentPlayer.playerId 
    });

    if (!playerData) {
      throw new Error(`Player not found for game result: ${tournamentPlayer.playerId}`);
    }

    // Create player domain entity
    const player = Player.create(
      playerData.id,
      playerData.name,
      {
        email: playerData.email || undefined,
        phone: playerData.phone || undefined,
        profileImageUrl: playerData.profileImageUrl || undefined,
        notes: playerData.notes || undefined,
        isActive: playerData.isActive ?? true,
        joinDate: new GameTime(new Date(playerData.joinDate || Date.now())),
      }
    );

    // Create value objects
    const position = new Position(tournamentPlayer.finalPosition || 1);
    const points = new Points(tournamentPlayer.points || 0);
    const gameTime = new GameTime(new Date(tournamentPlayer.checkedInAt || Date.now()));

    // Create game result entity
    return GameResult.create(
      tournamentPlayer.id,
      tournamentPlayer.tournamentId,
      player,
      position,
      points,
      {
        gameTime,
        bountyCount: tournamentPlayer.bountyPoints || 0,
        isConsolation: (tournamentPlayer.consolationPoints || 0) > 0,
        notes: tournamentPlayer.notes || undefined,
      }
    );
  }
}
