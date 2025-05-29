import type { Schema } from '@/amplify/data/resource';
import { Series } from '@/src/core/domain/entities/series';
import { GameTime } from '@/src/core/domain/value-objects/game-time';
import { ISeriesRepository } from '@/src/core/domain/repositories/series.repository';
import { generateClient } from 'aws-amplify/data';

/**
 * Amplify implementation of the Series Repository
 * Handles all series data operations using AWS Amplify
 */
export class AmplifySeriesRepository implements ISeriesRepository {
  private client = generateClient<Schema>();

  /**
   * Create a new series
   */
  async create(series: Series): Promise<Series> {
    try {
      const result = await this.client.models.Series.create({
        name: series.name,
        seasonId: series.seasonId,
        leagueId: 'default-league', // TODO: Get from context
        userId: 'default-user', // TODO: Get from auth context
        startDate: series.startDate.toISOString(),
        endDate: series.endDate.toISOString(),
        isActive: series.isActive,
        description: series.description || null,
      });

      if (!result.data) {
        throw new Error('Failed to create series');
      }

      return this.mapToSeries(result.data);
    } catch (error) {
      throw new Error(`Failed to create series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing series
   */
  async update(series: Series): Promise<Series> {
    try {
      const result = await this.client.models.Series.update({
        id: series.id,
        name: series.name,
        seasonId: series.seasonId,
        startDate: series.startDate.toISOString(),
        endDate: series.endDate.toISOString(),
        isActive: series.isActive,
        description: series.description || null,
      });

      if (!result.data) {
        throw new Error('Failed to update series');
      }

      return this.mapToSeries(result.data);
    } catch (error) {
      throw new Error(`Failed to update series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save a series (create or update)
   */
  async save(series: Series): Promise<Series> {
    try {
      // Check if series exists
      const existing = await this.findById(series.id);

      if (existing) {
        // Update existing series
        const result = await this.client.models.Series.update({
          id: series.id,
          name: series.name,
          seasonId: series.seasonId,
          startDate: series.startDate.toISOString(),
          endDate: series.endDate.toISOString(),
          isActive: series.isActive,
          description: series.description || null,
        });

        if (!result.data) {
          throw new Error('Failed to update series');
        }

        return this.mapToSeries(result.data);
      } else {
        // Create new series
        const result = await this.client.models.Series.create({
          name: series.name,
          seasonId: series.seasonId,
          leagueId: 'default-league', // TODO: Get from context
          userId: 'default-user', // TODO: Get from auth context
          startDate: series.startDate.toISOString(),
          endDate: series.endDate.toISOString(),
          isActive: series.isActive,
          description: series.description || null,
        });

        if (!result.data) {
          throw new Error('Failed to create series');
        }

        return this.mapToSeries(result.data);
      }
    } catch (error) {
      throw new Error(`Failed to save series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find series by ID
   */
  async findById(id: string): Promise<Series | null> {
    try {
      const result = await this.client.models.Series.get({ id });

      if (!result.data) {
        return null;
      }

      return this.mapToSeries(result.data);
    } catch (error) {
      throw new Error(`Failed to find series by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find all series
   */
  async findAll(): Promise<Series[]> {
    try {
      const result = await this.client.models.Series.list();
      return result.data?.map(data => this.mapToSeries(data)) || [];
    } catch (error) {
      throw new Error(`Failed to find all series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find series by season ID
   */
  async findBySeasonId(seasonId: string): Promise<Series[]> {
    try {
      const result = await this.client.models.Series.list({
        filter: { seasonId: { eq: seasonId } }
      });
      return result.data?.map(data => this.mapToSeries(data)) || [];
    } catch (error) {
      throw new Error(`Failed to find series by season ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find active series
   */
  async findActive(): Promise<Series[]> {
    try {
      const result = await this.client.models.Series.list({
        filter: { isActive: { eq: true } }
      });
      return result.data?.map(data => this.mapToSeries(data)) || [];
    } catch (error) {
      throw new Error(`Failed to find active series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a series exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const series = await this.findById(id);
      return series !== null;
    } catch {
      return false;
    }
  }

  /**
   * Delete a series by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const result = await this.client.models.Series.delete({ id });

      if (!result.data) {
        throw new Error('Failed to delete series');
      }
    } catch (error) {
      throw new Error(`Failed to delete series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find currently running series
   */
  async findCurrentlyActive(): Promise<Series[]> {
    try {
      const now = new Date().toISOString();
      const result = await this.client.models.Series.list({
        filter: {
          and: [
            { isActive: { eq: true } },
            { startDate: { le: now } },
            { endDate: { ge: now } }
          ]
        }
      });
      return result.data?.map(data => this.mapToSeries(data)) || [];
    } catch (error) {
      throw new Error(`Failed to find currently active series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find series by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Series[]> {
    try {
      const result = await this.client.models.Series.list({
        filter: {
          and: [
            { startDate: { ge: startDate.toISOString() } },
            { endDate: { le: endDate.toISOString() } }
          ]
        }
      });
      return result.data?.map(data => this.mapToSeries(data)) || [];
    } catch (error) {
      throw new Error(`Failed to find series by date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find series by name (partial match)
   */
  async findByName(name: string): Promise<Series[]> {
    try {
      const result = await this.client.models.Series.list({
        filter: { name: { contains: name } }
      });
      return result.data?.map(data => this.mapToSeries(data)) || [];
    } catch (error) {
      throw new Error(`Failed to find series by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find the most recent series for a season
   */
  async findMostRecentBySeasonId(seasonId: string): Promise<Series | null> {
    try {
      const result = await this.client.models.Series.list({
        filter: { seasonId: { eq: seasonId } }
      });
      
      if (!result.data || result.data.length === 0) {
        return null;
      }

      // Sort by start date descending to get the most recent
      const sortedSeries = result.data.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      return this.mapToSeries(sortedSeries[0]);
    } catch (error) {
      throw new Error(`Failed to find most recent series by season ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map Amplify data to Series domain entity
   */
  private mapToSeries(data: any): Series {
    const startDate = new GameTime(new Date(data.startDate));
    const endDate = new GameTime(new Date(data.endDate));
    const createdAt = data.createdAt ? new GameTime(new Date(data.createdAt)) : GameTime.now();

    return new Series(
      data.id,
      data.name,
      data.seasonId,
      startDate,
      endDate,
      createdAt,
      {
        isActive: data.isActive ?? true,
        description: data.description || undefined,
      }
    );
  }
}
