-- Drop all tables and extensions in reverse order
-- This will completely remove the inventory system schema

-- Drop tables in correct order (considering foreign key dependencies)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS asset_categories CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop extension (only if no other databases use it)
-- DROP EXTENSION IF EXISTS "uuid-ossp";