-- Migration: Change entity_id from UUID to VARCHAR for audit_logs table
-- This allows audit logs to reference entities with different ID types (UUID, INTEGER, etc.)

-- Drop existing constraint if exists
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_entity_id_check;

-- Change entity_id column type from UUID to VARCHAR(100)
ALTER TABLE audit_logs ALTER COLUMN entity_id TYPE VARCHAR(100) USING entity_id::VARCHAR;

-- Add index on entity_id for performance
CREATE INDEX IF NOT EXISTS audit_logs_entity_id_varchar_idx ON audit_logs(entity_id);

-- Add comment explaining the change
COMMENT ON COLUMN audit_logs.entity_id IS 'Entity ID that can be UUID, INTEGER, or other types stored as VARCHAR';
