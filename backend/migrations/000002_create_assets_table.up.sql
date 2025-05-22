CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    category_id UUID NOT NULL REFERENCES asset_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_deleted_at ON assets(deleted_at);

-- Add triggers for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON asset_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE assets IS 'Table for storing asset information';
COMMENT ON COLUMN assets.id IS 'Unique identifier for the asset';
COMMENT ON COLUMN assets.name IS 'Name of the asset';
COMMENT ON COLUMN assets.description IS 'Description of the asset';
COMMENT ON COLUMN assets.quantity IS 'Quantity of the asset';
COMMENT ON COLUMN assets.location IS 'Physical location of the asset';
COMMENT ON COLUMN assets.status IS 'Current status of the asset (available, in_use, maintenance, disposed)';
COMMENT ON COLUMN assets.category_id IS 'Reference to the asset category';
COMMENT ON COLUMN assets.deleted_at IS 'Soft delete timestamp';
