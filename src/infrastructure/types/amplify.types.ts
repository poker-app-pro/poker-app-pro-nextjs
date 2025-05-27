// Legacy Amplify types - DEPRECATED
// Use types from amplify-clean.types.ts instead
// This file is kept for backward compatibility during migration

// Re-export the new clean types for any remaining legacy imports
export type {
  CleanLeagueType as AmplifyLeagueData,
  CleanAmplifyDataClient as AmplifyDataClient,
  CleanAmplifyActivityLogClient as AmplifyActivityLogClient,
  CreateLeagueInput as AmplifyLeagueCreateInput,
  UpdateLeagueInput as AmplifyLeagueUpdateInput,
  CreateLeagueSettingsInput as AmplifyLeagueSettingsInput,
  CreateActivityLogInput as AmplifyActivityLogInput,
  RequestOptions as AmplifyAuthOptions,
  AmplifyDataResponse as AmplifyResponse,
  AmplifyListDataResponse as AmplifyListResponse
} from './amplify-clean.types';

// Legacy interface for backward compatibility
export interface AmplifyFilterOptions {
  filter?: Record<string, unknown>;
  authMode?: string;
}
