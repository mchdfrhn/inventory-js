-- Update any records with null kode to have a default value
UPDATE assets SET kode = 'DEFAULT-' || id::text WHERE kode IS NULL;

-- Add NOT NULL constraint to kode
ALTER TABLE assets ALTER COLUMN kode SET NOT NULL;

-- Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'status') THEN
        ALTER TABLE assets ADD COLUMN status varchar(20) DEFAULT 'available';
    END IF;
END
$$;
-- Update existing status values to use the new terminology
-- Set "available" to "baik"
UPDATE assets SET status = 'baik' WHERE status = 'available';

-- Set "in_use" or "maintenance" to "tidak_memadai" as needed
UPDATE assets SET status = 'rusak' WHERE status = 'disposed';

-- Update remaining old status values to appropriate new ones, if needed
UPDATE assets SET status = 'tidak_memadai' WHERE status = 'maintenance' OR status = 'in_use';

-- Ensure every asset has a status
UPDATE assets SET status = 'baik' WHERE status IS NULL OR status = '';

-- Update the default value in the database
ALTER TABLE assets ALTER COLUMN status SET DEFAULT 'baik';
