import { AmplifyAuthService } from '../amplify-auth.service';

// Mock AWS Amplify modules
jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: jest.fn(),
  signOut: jest.fn(),
  signIn: jest.fn(),
  signUp: jest.fn(),
  confirmSignUp: jest.fn(),
  resetPassword: jest.fn(),
  confirmResetPassword: jest.fn(),
}));

jest.mock('aws-amplify/data', () => ({
  generateClient: jest.fn(),
}));

// Import mocked functions
import { getCurrentUser, signOut, signIn, signUp, confirmSignUp, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';

const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockSignOut = signOut as jest.Mock;
const mockSignIn = signIn as jest.Mock;
const mockSignUp = signUp as jest.Mock;
const mockConfirmSignUp = confirmSignUp as jest.Mock;
const mockResetPassword = resetPassword as jest.Mock;
const mockConfirmResetPassword = confirmResetPassword as jest.Mock;
const mockGenerateClient = generateClient as jest.Mock;

// Mock the data client
const mockClient = {
  models: {
    User: {
      get: jest.fn(),
      create: jest.fn(),
    },
  },
};

describe('AmplifyAuthService', () => {
  let authService: AmplifyAuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateClient.mockReturnValue(mockClient);
    authService = new AmplifyAuthService();
  });

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      // Arrange
      const mockAmplifyUser = { userId: 'user-1' };
      const mockUserData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        isActive: true,
      };

      mockGetCurrentUser.mockResolvedValue(mockAmplifyUser);
      mockClient.models.User.get.mockResolvedValue({ data: mockUserData });

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['USER'],
        isActive: true,
      });
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
      expect(mockClient.models.User.get).toHaveBeenCalledWith({ id: 'user-1' });
    });

    it('should return null when not authenticated', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(null);

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when user data not found', async () => {
      // Arrange
      const mockAmplifyUser = { userId: 'user-1' };
      mockGetCurrentUser.mockResolvedValue(mockAmplifyUser);
      mockClient.models.User.get.mockResolvedValue({ data: null });

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      mockGetCurrentUser.mockRejectedValue(new Error('Auth error'));

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getCurrentUserId', () => {
    it('should return user ID when authenticated', async () => {
      // Arrange
      const mockAmplifyUser = { userId: 'user-1' };
      const mockUserData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        isActive: true,
      };

      mockGetCurrentUser.mockResolvedValue(mockAmplifyUser);
      mockClient.models.User.get.mockResolvedValue({ data: mockUserData });

      // Act
      const result = await authService.getCurrentUserId();

      // Assert
      expect(result).toBe('user-1');
    });

    it('should return null when not authenticated', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(null);

      // Act
      const result = await authService.getCurrentUserId();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      // Arrange
      const mockSignInResult = { isSignedIn: true };
      const mockUserData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        isActive: true,
      };

      mockSignIn.mockResolvedValue(mockSignInResult);
      mockGetCurrentUser.mockResolvedValue({ userId: 'user-1' });
      mockClient.models.User.get.mockResolvedValue({ data: mockUserData });

      // Act
      const result = await authService.signIn('test@example.com', 'password');

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(mockSignIn).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password',
      });
    });

    it('should fail when sign in is not successful', async () => {
      // Arrange
      const mockSignInResult = { isSignedIn: false };
      mockSignIn.mockResolvedValue(mockSignInResult);

      // Act
      const result = await authService.signIn('test@example.com', 'password');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign in failed');
    });

    it('should handle sign in errors', async () => {
      // Arrange
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

      // Act
      const result = await authService.signIn('test@example.com', 'password');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should sign up successfully when complete', async () => {
      // Arrange
      const mockSignUpResult = { 
        isSignUpComplete: true,
        userId: 'user-1',
      };
      const mockUserData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        isActive: true,
      };

      mockSignUp.mockResolvedValue(mockSignUpResult);
      mockClient.models.User.create.mockResolvedValue({ data: mockUserData });
      mockGetCurrentUser.mockResolvedValue({ userId: 'user-1' });
      mockClient.models.User.get.mockResolvedValue({ data: mockUserData });

      // Act
      const result = await authService.signUp('test@example.com', 'password', 'Test User');

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(mockSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password',
        options: {
          userAttributes: {
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      });
      expect(mockClient.models.User.create).toHaveBeenCalled();
    });

    it('should require confirmation when sign up is not complete', async () => {
      // Arrange
      const mockSignUpResult = { 
        isSignUpComplete: false,
        userId: 'user-1',
      };

      mockSignUp.mockResolvedValue(mockSignUpResult);

      // Act
      const result = await authService.signUp('test@example.com', 'password', 'Test User');

      // Assert
      expect(result.success).toBe(true);
      expect(result.requiresConfirmation).toBe(true);
    });

    it('should handle sign up errors', async () => {
      // Arrange
      mockSignUp.mockRejectedValue(new Error('Email already exists'));

      // Act
      const result = await authService.signUp('test@example.com', 'password', 'Test User');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      // Arrange
      mockSignOut.mockResolvedValue(undefined);

      // Act
      await authService.signOut();

      // Assert
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('should handle sign out errors', async () => {
      // Arrange
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      // Act & Assert
      await expect(authService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('confirmSignUp', () => {
    it('should confirm sign up successfully', async () => {
      // Arrange
      const mockConfirmResult = { isSignUpComplete: true };
      mockConfirmSignUp.mockResolvedValue(mockConfirmResult);

      // Act
      const result = await authService.confirmSignUp('test@example.com', '123456');

      // Assert
      expect(result.success).toBe(true);
      expect(mockConfirmSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        confirmationCode: '123456',
      });
    });

    it('should fail when confirmation is not complete', async () => {
      // Arrange
      const mockConfirmResult = { isSignUpComplete: false };
      mockConfirmSignUp.mockResolvedValue(mockConfirmResult);

      // Act
      const result = await authService.confirmSignUp('test@example.com', '123456');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Confirmation failed');
    });

    it('should handle confirmation errors', async () => {
      // Arrange
      mockConfirmSignUp.mockRejectedValue(new Error('Invalid code'));

      // Act
      const result = await authService.confirmSignUp('test@example.com', '123456');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid code');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      // Arrange
      mockResetPassword.mockResolvedValue({});

      // Act
      const result = await authService.resetPassword('test@example.com');

      // Assert
      expect(result.success).toBe(true);
      expect(mockResetPassword).toHaveBeenCalledWith({ username: 'test@example.com' });
    });

    it('should handle reset password errors', async () => {
      // Arrange
      mockResetPassword.mockRejectedValue(new Error('User not found'));

      // Act
      const result = await authService.resetPassword('test@example.com');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('confirmResetPassword', () => {
    it('should confirm reset password successfully', async () => {
      // Arrange
      mockConfirmResetPassword.mockResolvedValue({});

      // Act
      const result = await authService.confirmResetPassword('test@example.com', '123456', 'newpassword');

      // Assert
      expect(result.success).toBe(true);
      expect(mockConfirmResetPassword).toHaveBeenCalledWith({
        username: 'test@example.com',
        confirmationCode: '123456',
        newPassword: 'newpassword',
      });
    });

    it('should handle confirm reset password errors', async () => {
      // Arrange
      mockConfirmResetPassword.mockRejectedValue(new Error('Invalid code'));

      // Act
      const result = await authService.confirmResetPassword('test@example.com', '123456', 'newpassword');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid code');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue({ userId: 'user-1' });

      // Act
      const result = await authService.isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      // Arrange
      mockGetCurrentUser.mockRejectedValue(new Error('Not authenticated'));

      // Act
      const result = await authService.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', async () => {
      // Arrange
      const mockUserData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN,USER',
        isActive: true,
      };

      mockGetCurrentUser.mockResolvedValue({ userId: 'user-1' });
      mockClient.models.User.get.mockResolvedValue({ data: mockUserData });

      // Act
      const result = await authService.hasRole('ADMIN');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user does not have the role', async () => {
      // Arrange
      const mockUserData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        isActive: true,
      };

      mockGetCurrentUser.mockResolvedValue({ userId: 'user-1' });
      mockClient.models.User.get.mockResolvedValue({ data: mockUserData });

      // Act
      const result = await authService.hasRole('ADMIN');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when user is not authenticated', async () => {
      // Arrange
      mockGetCurrentUser.mockRejectedValue(new Error('Not authenticated'));

      // Act
      const result = await authService.hasRole('ADMIN');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getUserRoles', () => {
    it('should return user roles', async () => {
      // Arrange
      const mockUserData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN,USER',
        isActive: true,
      };

      mockGetCurrentUser.mockResolvedValue({ userId: 'user-1' });
      mockClient.models.User.get.mockResolvedValue({ data: mockUserData });

      // Act
      const result = await authService.getUserRoles();

      // Assert
      expect(result).toEqual(['ADMIN', 'USER']);
    });

    it('should return default role when user has no roles', async () => {
      // Arrange
      const mockUserData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: null,
        isActive: true,
      };

      mockGetCurrentUser.mockResolvedValue({ userId: 'user-1' });
      mockClient.models.User.get.mockResolvedValue({ data: mockUserData });

      // Act
      const result = await authService.getUserRoles();

      // Assert
      expect(result).toEqual(['USER']);
    });

    it('should return empty array when user is not authenticated', async () => {
      // Arrange
      mockGetCurrentUser.mockRejectedValue(new Error('Not authenticated'));

      // Act
      const result = await authService.getUserRoles();

      // Assert
      expect(result).toEqual([]);
    });
  });
});
