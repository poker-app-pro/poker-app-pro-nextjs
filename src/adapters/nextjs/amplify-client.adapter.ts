// Amplify Client Adapter for Next.js
// This isolates Amplify-specific dependencies and provides clean interfaces

import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";
import { cookies } from "next/headers";
import { Schema } from "@/amplify/data/resource";
import { 
  CleanAmplifyDataClient, 
  CleanAmplifyActivityLogClient,
  AmplifyConfiguration,
  CleanLeagueType,
  CleanLeagueSettingsType,
  CleanActivityLogType,
  isValidLeagueResponse,
  isValidLeagueArray
} from '@/src/infrastructure/types/amplify-clean.types';
import { AmplifyGeneratedClient } from '@/src/infrastructure/types/amplify-generated.types';
import { initializeContainer } from '@/src/infrastructure/di/container';

// Amplify configuration interface
export interface AmplifyConfig {
  config: AmplifyConfiguration;
}

export class NextJSAmplifyAdapter {
  private static amplifyDataClient: CleanAmplifyDataClient | null = null;
  private static amplifyActivityLogClient: CleanAmplifyActivityLogClient | null = null;
  private static isInitialized = false;

  // Transform raw Amplify response to clean type
  private static transformLeagueResponse(data: any): CleanLeagueType {
    return {
      id: data.id,
      name: data.name,
      userId: data.userId,
      description: data.description || undefined,
      isActive: data.isActive ?? true,
      seasons: data.seasons || [],
      series: data.series || [],
      tournaments: data.tournaments || [],
      scoreboards: data.scoreboards || [],
      qualifications: data.qualifications || [],
      leagueSettings: data.leagueSettings || [],
      imageUrl: data.imageUrl || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  private static transformLeagueSettingsResponse(data: any): CleanLeagueSettingsType {
    return {
      id: data.id,
      leagueId: data.leagueId,
      defaultPointsSystem: data.defaultPointsSystem || undefined,
      customPointsConfig: data.customPointsConfig || undefined,
      qualificationRules: data.qualificationRules || undefined,
      defaultBuyIn: data.defaultBuyIn || undefined,
      defaultStartingChips: data.defaultStartingChips || undefined,
      defaultBlindStructure: data.defaultBlindStructure || undefined,
      defaultGameType: data.defaultGameType || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  private static transformActivityLogResponse(data: any): CleanActivityLogType {
    return {
      id: data.id,
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      details: data.details || undefined,
      timestamp: data.timestamp || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  static initialize(amplifyConfig: AmplifyConfig): void {
    if (this.isInitialized) {
      return;
    }

    // Create Amplify clients
    const cookieBasedClient = generateServerClientUsingCookies<Schema>({
      config: amplifyConfig.config as any, // Type assertion to handle complex Amplify config types
      cookies,
    });

    // Create type-safe adapters that transform raw Amplify responses to clean types
    // Using type assertions to handle complex GraphQL error type compatibility
    this.amplifyDataClient = {
      models: {
        League: {
          create: async (input, options) => {
            const result = await cookieBasedClient.models.League.create(input, options);
            return {
              data: result.data ? this.transformLeagueResponse(result.data) : null,
              errors: result.errors as any // Type assertion for GraphQL error compatibility
            };
          },
          get: async (input, options) => {
            const result = await cookieBasedClient.models.League.get(input, options);
            return {
              data: result.data ? this.transformLeagueResponse(result.data) : null,
              errors: result.errors as any
            };
          },
          list: async (input, options) => {
            const result = await cookieBasedClient.models.League.list(input);
            return {
              data: result.data.map(item => item ? this.transformLeagueResponse(item) : null).filter(Boolean) as CleanLeagueType[],
              errors: result.errors as any
            };
          },
          update: async (input, options) => {
            const result = await cookieBasedClient.models.League.update(input, options);
            return {
              data: result.data ? this.transformLeagueResponse(result.data) : null,
              errors: result.errors as any
            };
          },
          delete: async (input, options) => {
            const result = await cookieBasedClient.models.League.delete(input, options);
            return {
              data: result.data ? this.transformLeagueResponse(result.data) : null,
              errors: result.errors as any
            };
          },
        },
        LeagueSettings: {
          create: async (input, options) => {
            const result = await cookieBasedClient.models.LeagueSettings.create(input, options);
            return {
              data: result.data ? this.transformLeagueSettingsResponse(result.data) : null,
              errors: result.errors as any
            };
          },
        }
      }
    };

    this.amplifyActivityLogClient = {
      models: {
        ActivityLog: {
          create: async (input, options) => {
            const result = await cookieBasedClient.models.ActivityLog.create(input, options);
            return {
              data: result.data ? this.transformActivityLogResponse(result.data) : null,
              errors: result.errors as any
            };
          },
        }
      }
    };

    // Initialize the DI container with Amplify clients (using type assertion for compatibility)
    initializeContainer(this.amplifyDataClient as any, this.amplifyActivityLogClient as any);
    
    this.isInitialized = true;
  }

  static getDataClient(): CleanAmplifyDataClient {
    if (!this.amplifyDataClient) {
      throw new Error('Amplify adapter not initialized. Call initialize() first.');
    }
    return this.amplifyDataClient;
  }

  static getActivityLogClient(): CleanAmplifyActivityLogClient {
    if (!this.amplifyActivityLogClient) {
      throw new Error('Amplify adapter not initialized. Call initialize() first.');
    }
    return this.amplifyActivityLogClient;
  }

  static isReady(): boolean {
    return this.isInitialized;
  }
}

// Utility function to ensure Amplify is initialized
export function ensureAmplifyInitialized(amplifyConfig: AmplifyConfig): void {
  if (!NextJSAmplifyAdapter.isReady()) {
    NextJSAmplifyAdapter.initialize(amplifyConfig);
  }
}
