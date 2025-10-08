// Test setup file
const mongoose = require('mongoose');

// Increase timeout for all tests
jest.setTimeout(10000);

// Mock external API calls
jest.mock('axios');

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Clean up after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
