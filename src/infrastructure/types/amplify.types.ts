// Amplify-specific type definitions to avoid using 'any'

export interface AmplifyAuthOptions {
  authMode: string;
}

export interface AmplifyError {
  message: string;
  code?: string;
}

export interface AmplifyResponse<T> {
  data: T | null;
  errors?: AmplifyError[];
}

export interface AmplifyListResponse<T> {
  data: T[];
  errors?: AmplifyError[];
}

export interface AmplifyLeagueData {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  imageUrl?: string;
  userId: string;
  seasons?: string[];
  series?: string[];
  tournaments?: string[];
  scoreboards?: string[];
  qualifications?: string[];
  leagueSettings?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AmplifyLeagueCreateInput {
  name: string;
  description?: string;
  isActive?: boolean;
  imageUrl?: string;
  userId: string;
  seasons: string[];
  series: string[];
  tournaments: string[];
  scoreboards: string[];
  qualifications: string[];
  leagueSettings: string[];
}

export interface AmplifyLeagueUpdateInput {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  imageUrl?: string;
}

export interface AmplifyLeagueSettingsInput {
  leagueId: string;
  defaultPointsSystem: string;
  defaultGameType: string;
  defaultBuyIn: number;
  defaultStartingChips: number;
  defaultBlindStructure: string;
}

export interface AmplifyActivityLogInput {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface AmplifyFilterOptions {
  filter?: Record<string, unknown>;
  authMode?: string;
}

// Amplify client interface with proper typing
export interface AmplifyDataClient {
  models: {
    League: {
      create(
        data: AmplifyLeagueCreateInput, 
        options?: AmplifyAuthOptions
      ): Promise<AmplifyResponse<AmplifyLeagueData>>;
      get(
        id: { id: string }, 
        options?: AmplifyAuthOptions
      ): Promise<AmplifyResponse<AmplifyLeagueData>>;
      list(
        options?: AmplifyFilterOptions
      ): Promise<AmplifyListResponse<AmplifyLeagueData>>;
      update(
        data: AmplifyLeagueUpdateInput, 
        options?: AmplifyAuthOptions
      ): Promise<AmplifyResponse<AmplifyLeagueData>>;
      delete(
        id: { id: string }, 
        options?: AmplifyAuthOptions
      ): Promise<AmplifyResponse<AmplifyLeagueData>>;
    };
    LeagueSettings: {
      create(
        data: AmplifyLeagueSettingsInput, 
        options?: AmplifyAuthOptions
      ): Promise<AmplifyResponse<unknown>>;
    };
  };
}

export interface AmplifyActivityLogClient {
  models: {
    ActivityLog: {
      create(
        data: AmplifyActivityLogInput, 
        options?: AmplifyAuthOptions
      ): Promise<AmplifyResponse<unknown>>;
    };
  };
}
