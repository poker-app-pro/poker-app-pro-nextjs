// Amplify Client Adapter for Next.js
// This isolates Amplify-specific dependencies and provides clean interfaces

import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";
import { cookies } from "next/headers";
import { Schema } from "../../../amplify/data/resource";
import { AmplifyDataClient, AmplifyActivityLogClient } from '../../infrastructure/types/amplify.types';
import { initializeContainer } from '../../infrastructure/di/container';

// Amplify configuration interface
export interface AmplifyConfig {
  config: unknown;
}

export class NextJSAmplifyAdapter {
  private static amplifyDataClient: AmplifyDataClient | null = null;
  private static amplifyActivityLogClient: AmplifyActivityLogClient | null = null;
  private static isInitialized = false;

  static initialize(amplifyConfig: AmplifyConfig): void {
    if (this.isInitialized) {
      return;
    }

    // Create Amplify clients
    const cookieBasedClient = generateServerClientUsingCookies<Schema>({
      config: amplifyConfig.config as any, // Type assertion to handle complex Amplify config types
      cookies,
    });

    // Adapt Amplify client to our interface using type assertions
    // This is necessary because Amplify's generated types are complex and don't match our simplified interfaces
    this.amplifyDataClient = {
      models: {
        League: {
          create: cookieBasedClient.models.League.create as any,
          get: cookieBasedClient.models.League.get as any,
          list: cookieBasedClient.models.League.list as any,
          update: cookieBasedClient.models.League.update as any,
          delete: cookieBasedClient.models.League.delete as any,
        },
        LeagueSettings: {
          create: cookieBasedClient.models.LeagueSettings.create as any,
        }
      }
    };

    this.amplifyActivityLogClient = {
      models: {
        ActivityLog: {
          create: cookieBasedClient.models.ActivityLog.create as any,
        }
      }
    };

    // Initialize the DI container with Amplify clients
    initializeContainer(this.amplifyDataClient, this.amplifyActivityLogClient);
    
    this.isInitialized = true;
  }

  static getDataClient(): AmplifyDataClient {
    if (!this.amplifyDataClient) {
      throw new Error('Amplify adapter not initialized. Call initialize() first.');
    }
    return this.amplifyDataClient;
  }

  static getActivityLogClient(): AmplifyActivityLogClient {
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
