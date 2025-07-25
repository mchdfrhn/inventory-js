const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

class PgMigrationManager {
  constructor() {
    this.client = new Client({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.username,
      password: config.database.password,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
    });
  }

  async connect() {
    try {
      await this.client.connect();
      logger.info('Connected to PostgreSQL database');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.client.end();
      logger.info('Disconnected from PostgreSQL database');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
    }
  }

  async createMigrationsTable() {
    try {
      await this.client.query(`
        CREATE TABLE IF NOT EXISTS pgmigrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          run_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      logger.info('Migrations table created/verified');
    } catch (error) {
      logger.error('Error creating migrations table:', error);
      throw error;
    }
  }

  async getAppliedMigrations() {
    try {
      const result = await this.client.query('SELECT name FROM pgmigrations ORDER BY id');
      return result.rows.map(row => row.name);
    } catch (error) {
      logger.error('Error getting applied migrations:', error);
      throw error;
    }
  }

  async getMigrationFiles() {
    const migrationsDir = path.join(__dirname, '../../migrations');

    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      logger.info('Created migrations directory');
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files;
  }

  async runMigration(filename) {
    try {
      const migrationPath = path.join(__dirname, '../../migrations', filename);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      await this.client.query('BEGIN');

      try {
        // Execute migration
        await this.client.query(migrationSQL);

        // Record migration only if execution was successful
        await this.client.query(
          'INSERT INTO pgmigrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
          [filename],
        );

        await this.client.query('COMMIT');
        logger.info(`Migration applied: ${filename}`);
      } catch (execError) {
        await this.client.query('ROLLBACK');

        // Check if it's a "already exists" error for triggers/indexes
        if (execError.message.includes('already exists') ||
            execError.code === '42710' || // duplicate object
            execError.code === '42P07') { // duplicate table

          logger.warn(`Migration ${filename} contains existing objects, marking as applied: ${execError.message}`);

          // Record migration as applied since objects already exist
          await this.client.query('BEGIN');
          await this.client.query(
            'INSERT INTO pgmigrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
            [filename],
          );
          await this.client.query('COMMIT');
          logger.info(`Migration marked as applied: ${filename}`);
        } else {
          throw execError;
        }
      }
    } catch (error) {
      logger.error(`Error applying migration ${filename}:`, error);
      throw error;
    }
  }

  async runPendingMigrations() {
    try {
      await this.connect();
      await this.createMigrationsTable();

      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = await this.getMigrationFiles();

      const pendingMigrations = migrationFiles.filter(
        file => !appliedMigrations.includes(file),
      );

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations to run');
        return;
      }

      logger.info(`Running ${pendingMigrations.length} pending migrations...`);

      for (const migration of pendingMigrations) {
        await this.runMigration(migration);
      }

      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration process failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async getMigrationStatus() {
    try {
      await this.connect();
      await this.createMigrationsTable();

      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = await this.getMigrationFiles();

      const status = migrationFiles.map(file => ({
        migration: file,
        applied: appliedMigrations.includes(file),
      }));

      return status;
    } catch (error) {
      logger.error('Error getting migration status:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = PgMigrationManager;
