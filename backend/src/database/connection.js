const { Sequelize } = require('sequelize');
const config = require('../config');
const logger = require('../utils/logger');

let sequelize;

// Database connection configuration
const dbConfig = {
  host: config.database.host,
  port: config.database.port,
  dialect: config.database.driver,
  logging: config.database.logging,
  pool: config.database.pool,
};

// Add timezone only for non-SQLite databases
if (config.database.driver !== 'sqlite') {
  dbConfig.timezone = config.database.timezone;
}

// Driver-specific configurations
switch (config.database.driver) {
case 'postgres':
  dbConfig.dialectOptions = {
    ssl: config.database.ssl ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  };
  break;
case 'mysql':
  dbConfig.dialectOptions = {
    charset: config.database.charset,
  };
  if (config.database.timezone) {
    dbConfig.dialectOptions.timezone = config.database.timezone;
  }
  break;
case 'sqlite':
  dbConfig.storage = config.database.database;
  break;
}

// Create Sequelize instance with better error handling
try {
  if (config.database.driver === 'sqlite') {
    sequelize = new Sequelize(dbConfig);
  } else {
    sequelize = new Sequelize(
      config.database.database,
      config.database.username,
      config.database.password,
      dbConfig,
    );
  }
} catch (error) {
  logger.error('Failed to create Sequelize instance:', error);
  process.exit(1);
}

// Test database connection with timeout
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('🔗 Database connection established successfully');
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    logger.error('Database config:', {
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      ssl: config.database.ssl,
    });
    throw error; // Don't exit immediately, let server handle
  }
};

module.exports = {
  sequelize,
  testConnection,
  Sequelize,
};
