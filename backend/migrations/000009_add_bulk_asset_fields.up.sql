-- Add bulk asset fields to support bulk asset creation and grouping
ALTER TABLE assets ADD COLUMN bulk_id UUID;
ALTER TABLE assets ADD COLUMN bulk_sequence INTEGER DEFAULT 1;
ALTER TABLE assets ADD COLUMN is_bulk_parent BOOLEAN DEFAULT FALSE;
ALTER TABLE assets ADD COLUMN bulk_total_count INTEGER DEFAULT 1;

-- Create index for bulk_id for faster queries
CREATE INDEX idx_assets_bulk_id ON assets(bulk_id);
CREATE INDEX idx_assets_is_bulk_parent ON assets(is_bulk_parent);

-- Add comment for documentation
COMMENT ON COLUMN assets.bulk_id IS 'UUID to group bulk assets together';
COMMENT ON COLUMN assets.bulk_sequence IS 'Sequence number within bulk group (1, 2, 3, etc.)';
COMMENT ON COLUMN assets.is_bulk_parent IS 'True if this is the parent/main record for bulk display';
COMMENT ON COLUMN assets.bulk_total_count IS 'Total count of assets in this bulk group';
