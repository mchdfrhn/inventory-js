-- Remove bulk asset fields
DROP INDEX IF EXISTS idx_assets_bulk_id;
DROP INDEX IF EXISTS idx_assets_is_bulk_parent;

ALTER TABLE assets DROP COLUMN IF EXISTS bulk_id;
ALTER TABLE assets DROP COLUMN IF EXISTS bulk_sequence;
ALTER TABLE assets DROP COLUMN IF EXISTS is_bulk_parent;
ALTER TABLE assets DROP COLUMN IF EXISTS bulk_total_count;
