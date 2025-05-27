// Generated Amplify types based on the schema
// These types represent the raw Amplify GraphQL responses

import { Schema } from "@/amplify/data/resource";

// Raw Amplify response types (with __typename and null values)
export type AmplifyLeagueResponse = {
  __typename: "League";
  id: string;
  name: string;
  userId: string;
  description: string | null;
  isActive: boolean | null;
  seasons: string[] | null;
  series: string[] | null;
  tournaments: string[] | null;
  scoreboards: string[] | null;
  qualifications: string[] | null;
  leagueSettings: string[] | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AmplifyLeagueSettingsResponse = {
  __typename: "LeagueSettings";
  id: string;
  leagueId: string;
  defaultPointsSystem: string | null;
  customPointsConfig: any | null;
  qualificationRules: any | null;
  defaultBuyIn: number | null;
  defaultStartingChips: number | null;
  defaultBlindStructure: string | null;
  defaultGameType: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AmplifyActivityLogResponse = {
  __typename: "ActivityLog";
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: any | null;
  timestamp: string | null;
  createdAt: string;
  updatedAt: string;
};

// GraphQL operation response types
export type CreateLeagueResponse = {
  createLeague: AmplifyLeagueResponse | null;
};

export type GetLeagueResponse = {
  getLeague: AmplifyLeagueResponse | null;
};

export type ListLeaguesResponse = {
  listLeagues: {
    __typename: "ModelLeagueConnection";
    items: (AmplifyLeagueResponse | null)[] | null;
    nextToken: string | null;
  } | null;
};

export type UpdateLeagueResponse = {
  updateLeague: AmplifyLeagueResponse | null;
};

export type DeleteLeagueResponse = {
  deleteLeague: AmplifyLeagueResponse | null;
};

export type CreateLeagueSettingsResponse = {
  createLeagueSettings: AmplifyLeagueSettingsResponse | null;
};

export type CreateActivityLogResponse = {
  createActivityLog: AmplifyActivityLogResponse | null;
};

// Input types for mutations
export type CreateLeagueInput = {
  name: string;
  userId: string;
  description?: string;
  isActive?: boolean;
  seasons?: string[];
  series?: string[];
  tournaments?: string[];
  scoreboards?: string[];
  qualifications?: string[];
  leagueSettings?: string[];
  imageUrl?: string;
};

export type UpdateLeagueInput = {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  seasons?: string[];
  series?: string[];
  tournaments?: string[];
  scoreboards?: string[];
  qualifications?: string[];
  leagueSettings?: string[];
  imageUrl?: string;
};

export type CreateLeagueSettingsInput = {
  leagueId: string;
  defaultPointsSystem?: string;
  customPointsConfig?: any;
  qualificationRules?: any;
  defaultBuyIn?: number;
  defaultStartingChips?: number;
  defaultBlindStructure?: string;
  defaultGameType?: string;
};

export type CreateActivityLogInput = {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  timestamp?: string;
};

// Filter and options types
export type LeagueFilterInput = {
  id?: { eq?: string };
  name?: { eq?: string };
  userId?: { eq?: string };
  isActive?: { eq?: boolean };
  and?: LeagueFilterInput[];
  or?: LeagueFilterInput[];
  not?: LeagueFilterInput;
};

export type ListLeaguesInput = {
  filter?: LeagueFilterInput;
  limit?: number;
  nextToken?: string;
};

export type AuthMode = "userPool" | "identityPool" | "apiKey" | "lambda";

export type RequestOptions = {
  authMode?: AuthMode;
};

// Amplify client method signatures
export type AmplifyLeagueModel = {
  create: (
    input: CreateLeagueInput,
    options?: RequestOptions
  ) => Promise<{ data: AmplifyLeagueResponse | null; errors?: any[] }>;
  
  get: (
    input: { id: string },
    options?: RequestOptions
  ) => Promise<{ data: AmplifyLeagueResponse | null; errors?: any[] }>;
  
  list: (
    input?: ListLeaguesInput,
    options?: RequestOptions
  ) => Promise<{ data: (AmplifyLeagueResponse | null)[]; errors?: any[] }>;
  
  update: (
    input: UpdateLeagueInput,
    options?: RequestOptions
  ) => Promise<{ data: AmplifyLeagueResponse | null; errors?: any[] }>;
  
  delete: (
    input: { id: string },
    options?: RequestOptions
  ) => Promise<{ data: AmplifyLeagueResponse | null; errors?: any[] }>;
};

export type AmplifyLeagueSettingsModel = {
  create: (
    input: CreateLeagueSettingsInput,
    options?: RequestOptions
  ) => Promise<{ data: AmplifyLeagueSettingsResponse | null; errors?: any[] }>;
};

export type AmplifyActivityLogModel = {
  create: (
    input: CreateActivityLogInput,
    options?: RequestOptions
  ) => Promise<{ data: AmplifyActivityLogResponse | null; errors?: any[] }>;
};

// Main client type
export type AmplifyGeneratedClient = {
  models: {
    League: AmplifyLeagueModel;
    LeagueSettings: AmplifyLeagueSettingsModel;
    ActivityLog: AmplifyActivityLogModel;
  };
};
