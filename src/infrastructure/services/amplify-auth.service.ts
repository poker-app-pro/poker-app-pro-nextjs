import { getCurrentUser, signOut, signIn, signUp, confirmSignUp, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

/**
 * Authentication Service Interface
 */
export interface IAuthService {
  getCurrentUser(): Promise<AuthUser | null>;
  getCurrentUserId(): Promise<string | null>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string, name: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  confirmSignUp(email: string, confirmationCode: string): Promise<AuthResult>;
  resetPassword(email: string): Promise<AuthResult>;
  confirmResetPassword(email: string, confirmationCode: string, newPassword: string): Promise<AuthResult>;
  isAuthenticated(): Promise<boolean>;
  hasRole(role: string): Promise<boolean>;
  getUserRoles(): Promise<string[]>;
}

/**
 * Authentication User
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
}

/**
 * Authentication Result
 */
export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  requiresConfirmation?: boolean;
}

/**
 * Amplify Authentication Service
 * Handles user authentication and authorization using AWS Amplify Auth
 */
export class AmplifyAuthService implements IAuthService {
  private client = generateClient<Schema>();

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const amplifyUser = await getCurrentUser();
      
      if (!amplifyUser) {
        return null;
      }

      // Get user details from our User model
      const { data: userData } = await this.client.models.User.get({ 
        id: amplifyUser.userId 
      });

      if (!userData) {
        return null;
      }

      return {
        id: amplifyUser.userId,
        email: userData.email,
        name: userData.name,
        roles: this.parseRoles(userData.role),
        isActive: userData.isActive ?? true,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getCurrentUserId(): Promise<string | null> {
    try {
      const user = await this.getCurrentUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await signIn({ username: email, password });
      
      if (result.isSignedIn) {
        const user = await this.getCurrentUser();
        return {
          success: true,
          user: user || undefined,
        };
      }

      return {
        success: false,
        error: 'Sign in failed',
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });

      if (result.isSignUpComplete) {
        // Create user record in our database
        await this.createUserRecord(result.userId!, email, name);
        
        const user = await this.getCurrentUser();
        return {
          success: true,
          user: user || undefined,
        };
      }

      return {
        success: true,
        requiresConfirmation: true,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Sign out failed');
    }
  }

  async confirmSignUp(email: string, confirmationCode: string): Promise<AuthResult> {
    try {
      const result = await confirmSignUp({
        username: email,
        confirmationCode,
      });

      if (result.isSignUpComplete) {
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: 'Confirmation failed',
      };
    } catch (error) {
      console.error('Confirm sign up error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Confirmation failed',
      };
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await resetPassword({ username: email });
      return {
        success: true,
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  }

  async confirmResetPassword(email: string, confirmationCode: string, newPassword: string): Promise<AuthResult> {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode,
        newPassword,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Confirm reset password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset confirmation failed',
      };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      return !!user;
    } catch {
      return false;
    }
  }

  async hasRole(role: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles();
      return roles.includes(role);
    } catch {
      return false;
    }
  }

  async getUserRoles(): Promise<string[]> {
    try {
      const user = await this.getCurrentUser();
      return user?.roles || [];
    } catch {
      return [];
    }
  }

  private async createUserRecord(userId: string, email: string, name: string): Promise<void> {
    try {
      await this.client.models.User.create({
        id: userId,
        email,
        name,
        role: 'USER', // Default role
        playerId: userId, // For now, user ID equals player ID
        isActive: true,
        preferences: {},
        leagues: [],
        seasons: [],
        series: [],
        tournaments: [],
        scoreboards: [],
        qualifications: [],
        activityLogs: [],
      });
    } catch (error) {
      console.error('Error creating user record:', error);
      // Don't throw here as the auth might still be successful
    }
  }

  private parseRoles(roleString?: string | null): string[] {
    if (!roleString) {
      return ['USER'];
    }

    // Handle comma-separated roles or single role
    return roleString.split(',').map(role => role.trim().toUpperCase());
  }
}

/**
 * Singleton instance of the auth service
 */
export const authService = new AmplifyAuthService();
