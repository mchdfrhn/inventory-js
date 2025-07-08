// Load test environment variables
require('dotenv').config({ path: '.env.test' });

const { sequelize } = require('../src/database/connection');

// Setup test database
beforeAll(async () => {
  // Force sync database for testing
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection after tests
  await sequelize.close();
});
