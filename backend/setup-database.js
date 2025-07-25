#!/usr/bin/env node

/**
 * Database Setup Script for Production
 * This script ensures the database exists before running migrations
 */

const { Client } = require('pg');
const config = require('./src/config');
const logger = require('./src/utils/logger');

async function setupDatabase() {
  const dbConfig = config.database;
  const dbName = dbConfig.database;

  // Connect to postgres system database first
  const systemClient = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: 'postgres', // Connect to system database
    ssl: dbConfig.ssl,
  });

  try {
    logger.info('🔗 Connecting to PostgreSQL system database...');
    await systemClient.connect();

    // Check if target database exists
    const checkDb = await systemClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName],
    );

    if (checkDb.rows.length === 0) {
      logger.info(`📊 Creating database: ${dbName}`);
      await systemClient.query(`CREATE DATABASE "${dbName}"`);
      logger.info(`✅ Database "${dbName}" created successfully`);
    } else {
      logger.info(`✅ Database "${dbName}" already exists`);
    }

    // Create uuid extension in target database
    await systemClient.end();

    const targetClient = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbName,
      ssl: dbConfig.ssl,
    });

    await targetClient.connect();

    // Create necessary extensions
    logger.info('🔧 Setting up database extensions...');
    await targetClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await targetClient.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');

    // Create the update_updated_at_column function
    logger.info('🔧 Creating trigger function...');
    await targetClient.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await targetClient.end();
    logger.info('✅ Database setup completed successfully');

  } catch (error) {
    logger.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    if (systemClient.ended === false) {
      await systemClient.end();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      logger.info('🎉 Database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
