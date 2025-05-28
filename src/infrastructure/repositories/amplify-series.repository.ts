import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { Series } from '../../core/domain/entities/series';
import { GameTime } from '../../core/domain/value-objects/game-time';
import { ISeriesRepository } from '../../core/domain/repositories/series.repository';

/**
 * Amplify implementation of Series Repository
 * Connects domain layer to AWS Amplify DataStore
 */
export class AmplifySeriesRepository implements ISeriesRepository {
  private client = generateClient<Schema>();

  async create(series: Series): Promise<Series> {
    try {
      const { data: newSeries } = await this.client.models.Series.create({
        id: series.id,
        name: series.name,
        description: series.description || null,
        seasonId: series.seasonId,
        leagueId: 'temp-league-id', // TODO: Get from series or context
        userId: 'system', // TODO: Get from auth context
        startDate: series.startDate.value.toISOString(),
        endDate: series.endDate.value.toISOString(),
        isActive: series.isActive,
        pointsSystem: null, // TODO: Add to domain entity if needed
        customPointsConfig: null, // TODO: Add to domain entity if needed
      });

      if (!newSeries) {
        throw new Error('Failed to create series');
      }

      return this.toDomainEntity(newSeries);
    } catch (error) {
      throw new Error(`Failed to create series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(series: Series): Promise<Series> {
    try {
      const { data: updatedSeries } = await this.client.models.Series.update({
        id: series.id,
        name: series.name,
        description: series.description || null,
        startDate: series.startDate.value.toISOString(),
        endDate: series.endDate.value.toISOString(),
        isActive: series.isActive,
      });

      if (!updatedSeries) {
        throw new Error('Failed to update series');
      }

      return this.toDomainEntity(updatedSeries);
    } catch (error) {
      throw new Error(`Failed to update series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { data: deletedSeries } = await this.client.models.Series.delete({ id });
      
      if (!deletedSeries) {
        throw new Error('Series not found or already deleted');
      }
    } catch (error) {
      throw new Error(`Failed to delete series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Series | null> {
    try {
      const { data: series } = await this.client.models.Series.get({ id });
      
      if (!series) {
        return null;
      }

      return this.toDomainEntity(series);
    } catch (error) {
      throw new Error(`Failed to find series by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Series[]> {
    try {
      const { data: seriesList } = await this.client.models.Series.list();

      if (!seriesList) {
        return [];
      }

      return seriesList.map(s => this.toDomainEntity(s));
    } catch (error) {
      throw new Error(`Failed to find all series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBySeasonId(seasonId: string): Promise<Series[]> {
    try {
      const { data: seriesList } = await this.client.models.Series.list({
        filter: { seasonId: { eq: seasonId } }
      });

      if (!seriesList) {
        return [];
      }

      return seriesList.map(s => this.toDomainEntity(s));
    } catch (error) {
      throw new Error(`Failed to find series by season ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findActive(): Promise<Series[]> {
    try {
      const { data: seriesList } = await this.client.models.Series.list({
        filter: { isActive: { eq: true } }
      });

      if (!seriesList) {
        return [];
      }

      return seriesList.map(s => this.toDomainEntity(s));
    } catch (error) {
      throw new Error(`Failed to find active series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findCurrentlyActive(): Promise<Series[]> {
    try {
      const now = new Date().toISOString();
      const { data: seriesList } = await this.client.models.Series.list({
        filter: {
          and: [
            { isActive: { eq: true } },
            { startDate: { le: now } },
            { endDate: { ge: now } }
          ]
        }
      });

      if (!seriesList) {
        return [];
      }

      return seriesList.map(s => this.toDomainEntity(s));
    } catch (error) {
      throw new Error(`Failed to find currently active series: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Series[]> {
    try {
      const { data: seriesList } = await this.client.models.Series.list({
        filter: {
          and: [
            { startDate: { ge: startDate.toISOString() } },
            { endDate: { le: endDate.toISOString() } }
          ]
        }
      });

      if (!seriesList) {
        return [];
      }

      return seriesList.map(s => this.toDomainEntity(s));
    } catch (error) {
      throw new Error(`Failed to find series by date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const series = await this.findById(id);
      return series !== null;
    } catch {
      return false;
    }
  }

  async findByName(name: string): Promise<Series[]> {
    try {
      const { data: seriesList } = await this.client.models.Series.list({
        filter: { name: { contains: name } }
      });

      if (!seriesList) {
        return [];
      }

      return seriesList.map(s => this.toDomainEntity(s));
    } catch (error) {
      throw new Error(`Failed to find series by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findMostRecentBySeasonId(seasonId: string): Promise<Series | null> {
    try {
      const { data: seriesList } = await this.client.models.Series.list({
        filter: { seasonId: { eq: seasonId } }
      });

      if (!seriesList || seriesList.length === 0) {
        return null;
      }

      // Convert to domain entities and sort by start date (most recent first)
      const domainSeries = seriesList.map(s => this.toDomainEntity(s));
      domainSeries.sort((a, b) => {
        if (a.startDate.isAfter(b.startDate)) return -1;
        if (a.startDate.isBefore(b.startDate)) return 1;
        return 0;
      });

      return domainSeries[0];
    } catch (error) {
      throw new Error(`Failed to find most recent series by season ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private toDomainEntity(amplifySeries: any): Series {
    return new Series(
      amplifySeries.id,
      amplifySeries.name,
      amplifySeries.seasonId,
      new GameTime(new Date(amplifySeries.startDate)),
      new GameTime(new Date(amplifySeries.endDate)),
      new GameTime(new Date(amplifySeries.createdAt || Date.now())),
      {
        isActive: amplifySeries.isActive ?? true,
        description: amplifySeries.description || undefined,
        updatedAt: new GameTime(new Date(amplifySeries.updatedAt || Date.now())),
      }
    );
  }
}
