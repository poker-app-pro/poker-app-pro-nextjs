/* eslint-disable no-undef */
// Jest setup file for src directory tests

// Mock AWS Amplify globally
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

// Global test utilities
global.createMockAmplifyClient = () => ({
  models: {
    Player: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
    },
    GameResult: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
    },
    User: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
    },
  },
});

// Suppress console warnings during tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
