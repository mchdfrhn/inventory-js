-- Migration: 004_create_audit_logs.sql
-- Up migration

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(100) NOT NULL CHECK (entity_type IN ('asset', 'category', 'location')),
  entity_id VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changes TEXT,
  old_values TEXT,
  new_values TEXT,
  user_id VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_entity_id ON audit_logs(entity_type, entity_id);

-- Add comment explaining the entity_id column
COMMENT ON COLUMN audit_logs.entity_id IS 'Entity ID that can be UUID, INTEGER, or other types stored as VARCHAR';
