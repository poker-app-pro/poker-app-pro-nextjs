// Next.js Framework Adapter for League functionality
// This layer isolates Next.js specific code and provides clean interfaces to the core

import { getContainer } from '../../infrastructure/di/container';
import { CreateLeagueRequest } from '../../core/domain/entities/league.entity';

// Framework-agnostic result types
export interface LeagueActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Next.js specific form data handling
export class NextJSLeagueAdapter {
  static async createLeague(formData: FormData): Promise<LeagueActionResult> {
    try {
      const container = getContainer();
      const createLeagueUseCase = container.getCreateLeagueUseCase();

      // Extract and validate form data
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const isActive = formData.get("isActive") === "on";
      const imageUrl = formData.get("imageUrl") as string;
      const userId = formData.get("userId") as string;

      if (!name?.trim()) {
        return { success: false, error: "League name is required" };
      }

      if (!userId) {
        return { success: false, error: "User ID is required" };
      }

      const request: CreateLeagueRequest = {
        name: name.trim(),
        description: description?.trim() || undefined,
        isActive,
        imageUrl: imageUrl?.trim() || undefined,
        userId
      };

      const result = await createLeagueUseCase.execute(request);
      return result;
    } catch (error) {
      console.error('Error in NextJS League Adapter:', error);
      return { success: false, error: 'Failed to create league' };
    }
  }

  static async getLeagues(options?: {
    userId?: string;
    activeOnly?: boolean;
    searchQuery?: string;
  }): Promise<LeagueActionResult> {
    try {
      const container = getContainer();
      const getLeaguesUseCase = container.getGetLeaguesUseCase();

      const result = await getLeaguesUseCase.execute({
        userId: options?.userId,
        activeOnly: options?.activeOnly,
        searchQuery: options?.searchQuery
      });

      return result;
    } catch (error) {
      console.error('Error in NextJS League Adapter:', error);
      return { success: false, error: 'Failed to fetch leagues' };
    }
  }

  static async getLeague(id: string): Promise<LeagueActionResult> {
    try {
      const container = getContainer();
      const leagueRepository = container.getLeagueRepository();

      const league = await leagueRepository.findById(id);
      
      if (!league) {
        return { success: false, error: 'League not found' };
      }

      return { success: true, data: league };
    } catch (error) {
      console.error('Error in NextJS League Adapter:', error);
      return { success: false, error: 'Failed to fetch league' };
    }
  }
}

// Framework-specific utilities
export class NextJSFormUtils {
  static extractFormData(formData: FormData): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        data[key] = value.trim();
      } else {
        data[key] = value;
      }
    }
    
    return data;
  }

  static validateRequiredFields(
    data: Record<string, unknown>, 
    requiredFields: string[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields = requiredFields.filter(field => 
      !data[field] || (typeof data[field] === 'string' && (data[field] as string).trim() === '')
    );

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
}
