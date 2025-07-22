// Jest setup file for API tests
// This file is run before each test suite

// Setup database connection for tests
beforeAll(async () => {
  // Wait for database connection to be established
  try {
    const { sequelize } = require('../src/database/connection');
    await sequelize.authenticate();
    console.log('Database connection established for tests');
  } catch (error) {
    console.error('Unable to connect to database for tests:', error);
    // Don't fail tests if database connection fails in CI environment
    if (process.env.NODE_ENV !== 'test') {
      throw error;
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    const { sequelize } = require('../src/database/connection');
    if (sequelize && !sequelize.connectionManager.pool._draining) {
      await sequelize.close();
      console.log('Database connection closed after tests');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
    // Don't fail cleanup
  }
});

// Increase timeout for database operations
jest.setTimeout(30000);
