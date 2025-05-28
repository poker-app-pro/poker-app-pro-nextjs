import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Player } from '../../core/domain/entities/player';
import { GameTime } from '../../core/domain/value-objects/game-time';
import { IPlayerRepository, PlayerSearchCriteria, PlayerSearchResult } from '../../core/domain/repositories/player.repository';

/**
 * Amplify implementation of Player Repository
 * Connects domain layer to AWS Amplify DataStore
 */
export class AmplifyPlayerRepository implements IPlayerRepository {
  private client = generateClient<Schema>();

  async save(player: Player): Promise<Player> {
    try {
      // Check if player exists (update vs create)
      const existingPlayer = await this.findById(player.id);
      
      if (existingPlayer) {
        // Update existing player
        const { data: updatedPlayer } = await this.client.models.Player.update({
          id: player.id,
          name: player.name,
          userId: 'system', // Default userId for now
          email: player.email || null,
          phone: player.phone || null,
          profileImageUrl: player.profileImageUrl || null,
          notes: player.notes || null,
          isActive: player.isActive,
          joinDate: player.joinDate.toISOString(),
        });

        if (!updatedPlayer) {
          throw new Error('Failed to update player');
        }

        return this.toDomainEntity(updatedPlayer);
      } else {
        // Create new player
        const { data: newPlayer } = await this.client.models.Player.create({
          id: player.id,
          name: player.name,
          userId: 'system', // Default userId for now
          email: player.email || null,
          phone: player.phone || null,
          profileImageUrl: player.profileImageUrl || null,
          notes: player.notes || null,
          isActive: player.isActive,
          joinDate: player.joinDate.toISOString(),
        });

        if (!newPlayer) {
          throw new Error('Failed to create player');
        }

        return this.toDomainEntity(newPlayer);
      }
    } catch (error) {
      throw new Error(`Failed to save player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Player | null> {
    try {
      const { data: player } = await this.client.models.Player.get({ id });
      
      if (!player) {
        return null;
      }

      return this.toDomainEntity(player);
    } catch (error) {
      throw new Error(`Failed to find player by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findMany(criteria: PlayerSearchCriteria): Promise<PlayerSearchResult> {
    try {
      // Build the query based on criteria
      let query = this.client.models.Player.list();

      // Apply filters
      const filters: any[] = [];
      
      if (criteria.query) {
        filters.push({
          or: [
            { name: { contains: criteria.query } },
            { email: { contains: criteria.query } },
          ]
        });
      }

      if (criteria.isActive !== undefined) {
        filters.push({ isActive: { eq: criteria.isActive } });
      }

      if (criteria.joinedAfter) {
        filters.push({ joinDate: { ge: criteria.joinedAfter.toISOString() } });
      }

      if (criteria.joinedBefore) {
        filters.push({ joinDate: { le: criteria.joinedBefore.toISOString() } });
      }

      // Apply filters if any exist
      if (filters.length > 0) {
        query = this.client.models.Player.list({
          filter: filters.length === 1 ? filters[0] : { and: filters }
        });
      }

      const { data: players } = await query;

      if (!players) {
        return {
          players: [],
          total: 0,
          page: criteria.page || 1,
          pageSize: criteria.pageSize || 20,
          totalPages: 0,
        };
      }

      // Convert to domain entities
      let domainPlayers = players.map(player => this.toDomainEntity(player));

      // Apply sorting
      if (criteria.sortBy) {
        domainPlayers.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          switch (criteria.sortBy) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'joinDate':
              aValue = a.joinDate.value.getTime();
              bValue = b.joinDate.value.getTime();
              break;
            default:
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
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
      const paginatedPlayers = domainPlayers.slice(startIndex, endIndex);
      const totalPages = Math.ceil(domainPlayers.length / pageSize);

      return {
        players: paginatedPlayers,
        total: domainPlayers.length,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      throw new Error(`Failed to search players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAllActive(): Promise<Player[]> {
    try {
      const { data: players } = await this.client.models.Player.list({
        filter: { isActive: { eq: true } }
      });

      if (!players) {
        return [];
      }

      return players.map(player => this.toDomainEntity(player));
    } catch (error) {
      throw new Error(`Failed to find active players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const player = await this.findById(id);
      return player !== null;
    } catch (error) {
      return false;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { data: deletedPlayer } = await this.client.models.Player.delete({ id });
      
      if (!deletedPlayer) {
        throw new Error('Player not found or already deleted');
      }
    } catch (error) {
      throw new Error(`Failed to delete player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async count(): Promise<number> {
    try {
      const { data: players } = await this.client.models.Player.list();
      return players?.length || 0;
    } catch (error) {
      throw new Error(`Failed to count players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private toDomainEntity(amplifyPlayer: any): Player {
    return Player.create(
      amplifyPlayer.id,
      amplifyPlayer.name,
      {
        email: amplifyPlayer.email || undefined,
        phone: amplifyPlayer.phone || undefined,
        profileImageUrl: amplifyPlayer.profileImageUrl || undefined,
        notes: amplifyPlayer.notes || undefined,
        isActive: amplifyPlayer.isActive,
        joinDate: new GameTime(new Date(amplifyPlayer.joinDate || Date.now())),
      }
    );
  }
}
