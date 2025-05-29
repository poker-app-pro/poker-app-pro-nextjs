import type { Schema } from '@/amplify/data/resource';
import { Player } from '@/src/core/domain/entities/player';
import { generateClient } from 'aws-amplify/data';
import { GameTime } from '@/src/core/domain/value-objects/game-time';
import {
  IPlayerRepository,
  PlayerSearchCriteria,
  PlayerSearchResult
} from '@/src/core/domain/repositories/player.repository';

/**
 * Amplify implementation of the Player Repository
 * Handles all player data operations using AWS Amplify
 */
export class AmplifyPlayerRepository implements IPlayerRepository {
  private client = generateClient<Schema>();

  /**
   * Save a player (create or update)
   */
  async save(player: Player): Promise<Player> {
    try {
      // Check if player exists
      const existing = await this.findById(player.id);
      
      if (existing) {
        // Update existing player
        const result = await this.client.models.Player.update({
          id: player.id,
          name: player.name,
          userId: player.email || '', // Using email as userId for now
          isActive: player.isActive,
          // Map other fields as needed based on your Amplify schema
        });

        if (!result.data) {
          throw new Error('Failed to update player');
        }

        return this.mapToPlayer(result.data);
      } else {
        // Create new player
        const result = await this.client.models.Player.create({
          id: player.id,
          name: player.name,
          userId: player.email || '', // Using email as userId for now
          isActive: player.isActive,
          // Map other fields as needed based on your Amplify schema
        });

        if (!result.data) {
          throw new Error('Failed to create player');
        }

        return this.mapToPlayer(result.data);
      }
    } catch (error) {
      throw new Error(`Failed to save player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find player by ID
   */
  async findById(id: string): Promise<Player | null> {
    try {
      const result = await this.client.models.Player.get({ id });
      
      if (!result.data) {
        return null;
      }

      return this.mapToPlayer(result.data);
    } catch (error) {
      throw new Error(`Failed to find player by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find players by criteria
   */
  async findMany(criteria: PlayerSearchCriteria): Promise<PlayerSearchResult> {
    try {
      const filter: any = {};

      // Build filter based on criteria
      if (criteria.query) {
        filter.name = { contains: criteria.query };
      }
      if (criteria.isActive !== undefined) {
        filter.isActive = { eq: criteria.isActive };
      }

      const pageSize = criteria.pageSize || 20;
      const page = criteria.page || 1;
      
      const result = await this.client.models.Player.list({
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        limit: pageSize,
        // Note: Amplify pagination works differently, this is a simplified implementation
      });

      const players = result.data?.map(data => this.mapToPlayer(data)) || [];
      
      // Apply client-side filtering for date ranges if needed
      let filteredPlayers = players;
      if (criteria.joinedAfter) {
        const afterDate = new GameTime(criteria.joinedAfter);
        filteredPlayers = filteredPlayers.filter(p => p.joinDate.isAfter(afterDate) || p.joinDate.equals(afterDate));
      }
      if (criteria.joinedBefore) {
        const beforeDate = new GameTime(criteria.joinedBefore);
        filteredPlayers = filteredPlayers.filter(p => p.joinDate.isBefore(beforeDate) || p.joinDate.equals(beforeDate));
      }

      // Apply sorting
      if (criteria.sortBy) {
        filteredPlayers.sort((a, b) => {
          let comparison = 0;
          if (criteria.sortBy === 'name') {
            comparison = a.name.localeCompare(b.name);
          } else if (criteria.sortBy === 'joinDate') {
            comparison = a.joinDate.isBefore(b.joinDate) ? -1 : a.joinDate.isAfter(b.joinDate) ? 1 : 0;
          }
          return criteria.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      const total = filteredPlayers.length;
      const totalPages = Math.ceil(total / pageSize);
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const paginatedPlayers = filteredPlayers.slice(startIndex, startIndex + pageSize);

      return {
        players: paginatedPlayers,
        total,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      throw new Error(`Failed to find players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find all active players
   */
  async findAllActive(): Promise<Player[]> {
    try {
      const result = await this.client.models.Player.list({
        filter: { isActive: { eq: true } }
      });

      return result.data?.map(data => this.mapToPlayer(data)) || [];
    } catch (error) {
      throw new Error(`Failed to find active players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a player exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const player = await this.findById(id);
      return player !== null;
    } catch {
      return false;
    }
  }

  /**
   * Delete a player by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const result = await this.client.models.Player.delete({ id });
      
      if (!result.data) {
        throw new Error('Failed to delete player');
      }
    } catch (error) {
      throw new Error(`Failed to delete player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Count total players
   */
  async count(criteria?: Partial<PlayerSearchCriteria>): Promise<number> {
    try {
      const filter: any = {};

      if (criteria?.query) {
        filter.name = { contains: criteria.query };
      }
      if (criteria?.isActive !== undefined) {
        filter.isActive = { eq: criteria.isActive };
      }

      const result = await this.client.models.Player.list({
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      });

      return result.data?.length || 0;
    } catch (error) {
      throw new Error(`Failed to count players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map Amplify data to Player domain entity
   */
  private mapToPlayer(data: any): Player {
    // Create a join date from createdAt or use current time as fallback
    const joinDate = data.createdAt ? new GameTime(new Date(data.createdAt)) : GameTime.now();
    
    return new Player(
      data.id,
      data.name,
      joinDate,
      {
        email: data.userId, // Assuming userId contains email
        phone: data.phone,
        isActive: data.isActive ?? true,
        profileImageUrl: data.profileImageUrl,
        notes: data.notes,
      }
    );
  }
}
