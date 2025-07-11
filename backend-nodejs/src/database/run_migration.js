const { sequelize } = require('./connection');
async function runMigration() {
  try {
    console.log('🔄 Running migration to change entity_id type...');

    // Drop existing constraint if exists
    await sequelize.query('ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_entity_id_check');

    // Change entity_id column type from UUID to VARCHAR(100)
    await sequelize.query('ALTER TABLE audit_logs ALTER COLUMN entity_id TYPE VARCHAR(100) USING entity_id::VARCHAR');

    // Add index on entity_id for performance
    await sequelize.query('CREATE INDEX IF NOT EXISTS audit_logs_entity_id_varchar_idx ON audit_logs(entity_id)');

    // Add comment explaining the change
    await sequelize.query('COMMENT ON COLUMN audit_logs.entity_id IS \'Entity ID that can be UUID, INTEGER, or other types stored as VARCHAR\'');

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
