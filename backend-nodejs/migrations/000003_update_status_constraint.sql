-- Migration to update status constraint from ['baik', 'rusak', 'dalam_perbaikan', 'tidak_aktif'] 
-- to ['baik', 'rusak', 'tidak_memadai']

-- First, update any existing data with old status values to new ones
UPDATE assets 
SET status = 'tidak_memadai' 
WHERE status IN ('dalam_perbaikan', 'tidak_aktif');

-- Drop the old constraint
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;

-- Add the new constraint
ALTER TABLE assets ADD CONSTRAINT assets_status_check 
CHECK (status IN ('baik', 'rusak', 'tidak_memadai'));

-- Update any default values if needed
SELECT COUNT(*) as total_assets, status 
FROM assets 
GROUP BY status 
ORDER BY status;
