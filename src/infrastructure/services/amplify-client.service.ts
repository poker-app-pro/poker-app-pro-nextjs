import {
  generateServerClientUsingCookies,
  generateServerClientUsingReqRes,
} from "@aws-amplify/adapter-nextjs/api";
import { cookies } from "next/headers";
import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import amplifyConfig from "../../../amplify_outputs.json";
import { Schema } from "../../../amplify/data/resource";

/**
 * Amplify Client Service Interface
 */
export interface IAmplifyClientService {
  getServerClient(): ReturnType<typeof generateServerClientUsingCookies<Schema>>;
  getReqResClient(): ReturnType<typeof generateServerClientUsingReqRes<Schema>>;
  runWithAmplifyServerContext: ReturnType<typeof createServerRunner>['runWithAmplifyServerContext'];
}

/**
 * Amplify Client Service
 * Provides configured Amplify clients for server-side operations
 * Migrated from lib/amplify-utils.ts into clean architecture
 */
export class AmplifyClientService implements IAmplifyClientService {
  private static instance: AmplifyClientService;
  
  private _serverRunner: ReturnType<typeof createServerRunner>;
  private _reqResClient: ReturnType<typeof generateServerClientUsingReqRes<Schema>>;
  private _cookieClient: ReturnType<typeof generateServerClientUsingCookies<Schema>>;

  private constructor() {
    // Initialize server runner
    this._serverRunner = createServerRunner({
      config: amplifyConfig,
    });

    // Initialize req/res based client
    this._reqResClient = generateServerClientUsingReqRes<Schema>({
      config: amplifyConfig,
    });

    // Initialize cookie-based client
    this._cookieClient = generateServerClientUsingCookies<Schema>({
      config: amplifyConfig,
      cookies,
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AmplifyClientService {
    if (!AmplifyClientService.instance) {
      AmplifyClientService.instance = new AmplifyClientService();
    }
    return AmplifyClientService.instance;
  }

  /**
   * Get server client using cookies (for Next.js server components)
   */
  getServerClient() {
    return this._cookieClient;
  }

  /**
   * Get req/res based client (for API routes)
   */
  getReqResClient() {
    return this._reqResClient;
  }

  /**
   * Get server context runner
   */
  get runWithAmplifyServerContext() {
    return this._serverRunner.runWithAmplifyServerContext;
  }
}

/**
 * Convenience functions for backward compatibility
 * These maintain the same API as the original lib/amplify-utils.ts
 */
const clientService = AmplifyClientService.getInstance();

export const { runWithAmplifyServerContext } = clientService;
export const reqResBasedClient = clientService.getReqResClient();
export const cookieBasedClient = clientService.getServerClient();

/**
 * Export the service instance for dependency injection
 */
export const amplifyClientService = clientService;
