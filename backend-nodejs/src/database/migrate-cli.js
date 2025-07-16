#!/usr/bin/env node

const PgMigrationManager = require('./PgMigrationManager');
const logger = require('../utils/logger');

async function runMigrations() {
  try {
    logger.info('🚀 Starting database migrations...');

    const migrationManager = new PgMigrationManager();
    await migrationManager.runPendingMigrations();

    logger.info('✅ Migration process completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function getMigrationStatus() {
  try {
    const migrationManager = new PgMigrationManager();
    const status = await migrationManager.getMigrationStatus();

    // eslint-disable-next-line no-console
    console.log('\n📊 Migration Status:');
    // eslint-disable-next-line no-console
    console.log('=====================');

    status.forEach(({ migration, applied }) => {
      const statusIcon = applied ? '✅' : '⏳';
      const statusText = applied ? 'Applied' : 'Pending';
      // eslint-disable-next-line no-console
      console.log(`${statusIcon} ${migration} - ${statusText}`);
    });

    // eslint-disable-next-line no-console
    console.log('\n');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error getting migration status:', error);
    process.exit(1);
  }
}

// CLI command handling
const command = process.argv[2];

switch (command) {
case 'up':
case 'migrate':
  runMigrations();
  break;
case 'status':
  getMigrationStatus();
  break;
default:
  // eslint-disable-next-line no-console
  console.log('Usage:');
  // eslint-disable-next-line no-console
  console.log('  node src/database/migrate-cli.js up      - Run pending migrations');
  // eslint-disable-next-line no-console
  console.log('  node src/database/migrate-cli.js status  - Show migration status');
  process.exit(1);
}
