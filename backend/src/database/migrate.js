#!/usr/bin/env node

const MigrationManager = require('./MigrationManager');
const PgMigrationManager = require('./PgMigrationManager');
const logger = require('../utils/logger');

async function runLegacyMigrations() {
  try {
    logger.info('🚀 Starting legacy migration process...');

    const migrationManager = new MigrationManager();
    await migrationManager.runMigrations();
    await migrationManager.createIndexes();

    logger.info('✅ Legacy migration process completed successfully');
  } catch (error) {
    logger.error('❌ Legacy migration failed:', error);
    throw error;
  }
}

async function runPgMigrations() {
  try {
    logger.info('🚀 Starting pg-migrate process...');

    const pgMigrationManager = new PgMigrationManager();
    await pgMigrationManager.runPendingMigrations();

    logger.info('✅ Pg-migrate process completed successfully');
  } catch (error) {
    logger.error('❌ Pg-migrate failed:', error);
    throw error;
  }
}

async function runMigrations() {
  try {
    logger.info('🚀 Starting combined migration process...');

    // Run new pg-migrate system
    await runPgMigrations();

    // Keep legacy migration for backward compatibility if needed
    // await runLegacyMigrations();

    logger.info('✅ Migration process completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = {
  runMigrations,
  runLegacyMigrations,
  runPgMigrations,
};
