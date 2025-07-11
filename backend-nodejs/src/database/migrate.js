#!/usr/bin/env node

const MigrationManager = require('./MigrationManager');
const logger = require('../utils/logger');

async function runMigrations() {
  try {
    logger.info('🚀 Starting migration process...');

    const migrationManager = new MigrationManager();
    await migrationManager.runMigrations();
    await migrationManager.createIndexes();

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

module.exports = runMigrations;
