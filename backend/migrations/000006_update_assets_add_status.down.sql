-- Remove NOT NULL constraint from kode
ALTER TABLE assets ALTER COLUMN kode DROP NOT NULL;

-- Remove status column if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assets' AND column_name = 'status') THEN
        ALTER TABLE assets DROP COLUMN status;
    END IF;
END
$$;
