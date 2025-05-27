// Clean Amplify types with __typename and null values removed
// Following the article's guidance for creating usable frontend types

import { DeepOmit } from './deep-omit';
import {
  AmplifyLeagueResponse,
  AmplifyLeagueSettingsResponse,
  AmplifyActivityLogResponse,
  CreateLeagueInput,
  UpdateLeagueInput,
  CreateLeagueSettingsInput,
  CreateActivityLogInput,
  ListLeaguesInput,
  RequestOptions,
  AuthMode
} from './amplify-generated.types';

// Clean domain types without __typename and null values
export type CleanLeagueType = DeepOmit<
  Exclude<AmplifyLeagueResponse, null>,
  '__typename'
> & {
  // Override specific fields to remove null types
  description?: string;
  isActive: boolean;
  seasons: string[];
  series: string[];
  tournaments: string[];
  scoreboards: string[];
  qualifications: string[];
  leagueSettings: string[];
  imageUrl?: string;
};

export type CleanLeagueSettingsType = DeepOmit<
  Exclude<AmplifyLeagueSettingsResponse, null>,
  '__typename'
> & {
  // Override specific fields to remove null types
  defaultPointsSystem?: string;
  customPointsConfig?: Record<string, unknown>;
  qualificationRules?: Record<string, unknown>;
  defaultBuyIn?: number;
  defaultStartingChips?: number;
  defaultBlindStructure?: string;
  defaultGameType?: string;
};

export type CleanActivityLogType = DeepOmit<
  Exclude<AmplifyActivityLogResponse, null>,
  '__typename'
> & {
  // Override specific fields to remove null types
  details?: Record<string, unknown>;
  timestamp?: string;
};

// Response wrapper types that handle the data structure
export type AmplifyDataResponse<T> = {
  data: T | null;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
};

export type AmplifyListDataResponse<T> = {
  data: T[];
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
};

// Clean client interface that uses proper types instead of 'any'
export interface CleanAmplifyDataClient {
  models: {
    League: {
      create: (
        input: CreateLeagueInput,
        options?: RequestOptions
      ) => Promise<AmplifyDataResponse<CleanLeagueType>>;
      
      get: (
        input: { id: string },
        options?: RequestOptions
      ) => Promise<AmplifyDataResponse<CleanLeagueType>>;
      
      list: (
        input?: ListLeaguesInput,
        options?: RequestOptions
      ) => Promise<AmplifyListDataResponse<CleanLeagueType>>;
      
      update: (
        input: UpdateLeagueInput,
        options?: RequestOptions
      ) => Promise<AmplifyDataResponse<CleanLeagueType>>;
      
      delete: (
        input: { id: string },
        options?: RequestOptions
      ) => Promise<AmplifyDataResponse<CleanLeagueType>>;
    };
    LeagueSettings: {
      create: (
        input: CreateLeagueSettingsInput,
        options?: RequestOptions
      ) => Promise<AmplifyDataResponse<CleanLeagueSettingsType>>;
    };
  };
}

export interface CleanAmplifyActivityLogClient {
  models: {
    ActivityLog: {
      create: (
        input: CreateActivityLogInput,
        options?: RequestOptions
      ) => Promise<AmplifyDataResponse<CleanActivityLogType>>;
    };
  };
}

// Type guards for runtime type checking
export function isValidLeagueResponse(data: unknown): data is CleanLeagueType {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'userId' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).userId === 'string'
  );
}

export function isValidLeagueArray(data: unknown): data is CleanLeagueType[] {
  return Array.isArray(data) && data.every(isValidLeagueResponse);
}

// Configuration type with proper typing instead of 'unknown'
export interface AmplifyConfiguration {
  aws_project_region: string;
  aws_appsync_graphqlEndpoint: string;
  aws_appsync_region: string;
  aws_appsync_authenticationType: string;
  aws_appsync_apiKey?: string;
  aws_cognito_identity_pool_id?: string;
  aws_cognito_region?: string;
  aws_user_pools_id?: string;
  aws_user_pools_web_client_id?: string;
  oauth?: Record<string, unknown>;
  federationTarget?: string;
  aws_cognito_username_attributes?: string[];
  aws_cognito_social_providers?: string[];
  aws_cognito_signup_attributes?: string[];
  aws_cognito_mfa_configuration?: string;
  aws_cognito_mfa_types?: string[];
  aws_cognito_password_protection_settings?: Record<string, unknown>;
  aws_cognito_verification_mechanisms?: string[];
}

// Export re-usable input types
export type {
  CreateLeagueInput,
  UpdateLeagueInput,
  CreateLeagueSettingsInput,
  CreateActivityLogInput,
  ListLeaguesInput,
  RequestOptions,
  AuthMode
};
