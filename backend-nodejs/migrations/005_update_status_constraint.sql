-- Migration: 005_update_status_constraint.sql
-- Up migration

-- Drop existing constraint if exists
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;

-- Add updated status constraint with more status options
ALTER TABLE assets ADD CONSTRAINT assets_status_check 
CHECK (status IN ('baik', 'rusak', 'tidak_memadai', 'maintenance', 'retired', 'missing'));

-- Update any existing records with invalid status to 'baik'
UPDATE assets SET status = 'baik' WHERE status NOT IN ('baik', 'rusak', 'tidak_memadai', 'maintenance', 'retired', 'missing');
