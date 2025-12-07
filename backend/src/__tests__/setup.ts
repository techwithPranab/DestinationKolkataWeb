/**
 * Jest Setup File
 *
 * Configuration and initialization for all test suites
 */

/// <reference types="jest" />

import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
Object.assign(global, {
  TextEncoder,
  TextDecoder
});

// Set test environment variables
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/destination-kolkata-test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

// Mock console methods to reduce test output noise
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global timeout for async operations
jest.setTimeout(10000);

export {};
